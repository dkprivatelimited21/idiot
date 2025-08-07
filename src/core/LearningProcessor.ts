// src/core/LearningProcessor.ts
import { MemoryBrain } from './MemoryBrain';
import { CommandProcessor } from '@/utils/commandProcessor';
import { saveMemory, loadMemory, synthesizeSpeech } from '@/api';

interface LearningEntry {
  input: {
    original: string;
    normalized: string;
    keywords: string[];
    intent: string;
  };
  response: {
    text: string;
    confidence: number;
    source: string;
  };
  usage: {
    timesUsed: number;
    lastUsed: Date;
  };
}

export class LearningProcessor {
  private brain: MemoryBrain;
  private hardcoded: CommandProcessor;
  private token: string | null;
  private loadedMemory: LearningEntry[] = [];

  constructor(token: string | null = null) {
    this.brain = new MemoryBrain();
    this.hardcoded = new CommandProcessor();
    this.token = token;
  }

  public async process(input: string): Promise<{text: string; speech?: string}> {
    // Load from backend first if authenticated
    if (this.token) {
      try {
        const memoryData = await loadMemory(this.token);
        this.loadedMemory = memoryData.learningEntries || [];
        
        const remembered = this.findInLoadedMemory(input);
        if (remembered) {
          // Update usage stats on backend
          await this.updateUsageStats(input, remembered);
          
          return {
            text: remembered,
            speech: remembered
          };
        }
      } catch (err) {
        console.error('Failed to load memory:', err);
      }
    }

    // Check local brain memory
    const localMemory = this.brain.recall(input);
    if (localMemory) {
      return {
        text: localMemory,
        speech: localMemory
      };
    }

    // Fallback to hardcoded commands
    const textResponse = await this.hardcoded.processCommand(input);
    
    // Try to generate speech version
    let speechResponse = textResponse;
    if (this.token) {
      try {
        const synthResponse = await synthesizeSpeech(this.token, textResponse);
        speechResponse = synthResponse.speech?.text || textResponse;
      } catch (err) {
        console.error('Speech synthesis failed:', err);
      }
      
      // Save to backend with auto-learning
      try {
        await this.saveToBackend(input, textResponse);
      } catch (err) {
        console.error('Failed to save memory:', err);
      }
    } else {
      // Save to local brain if no backend
      this.brain.learn(input, textResponse);
    }
    
    return {
      text: textResponse,
      speech: speechResponse
    };
  }

  private findInLoadedMemory(input: string): string | null {
    if (!this.loadedMemory.length) return null;

    const normalizedInput = this.normalizeInput(input);
    let bestMatch: LearningEntry | null = null;
    let bestScore = 0;

    for (const entry of this.loadedMemory) {
      const similarity = this.calculateSimilarity(normalizedInput, entry.input.normalized);
      const confidenceScore = similarity * entry.response.confidence;
      
      if (confidenceScore > bestScore && confidenceScore > 0.5) {
        bestScore = confidenceScore;
        bestMatch = entry;
      }
    }

    return bestMatch ? bestMatch.response.text : null;
  }

  private calculateSimilarity(input1: string, input2: string): number {
    const words1 = input1.toLowerCase().split(/\s+/);
    const words2 = input2.toLowerCase().split(/\s+/);
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  private normalizeInput(input: string): string {
    return input.toLowerCase().trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
  }

  private async saveToBackend(input: string, response: string): Promise<void> {
    if (!this.token) return;
    
    try {
      // Use the AI processing endpoint to save with learning
      await fetch('/api/ai/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          input,
          response, // This should trigger auto-learning
          sessionId: this.generateSessionId()
        })
      });
    } catch (error) {
      console.error('Backend save failed:', error);
      // Fallback to old saveMemory method
      await saveMemory(this.token, input, response);
    }
  }

  private async updateUsageStats(input: string, response: string): Promise<void> {
    if (!this.token) return;
    
    try {
      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          sessionId: this.generateSessionId(),
          messageIndex: 0, // Simplified
          rating: 5, // Auto-positive feedback for usage
        })
      });
    } catch (error) {
      console.error('Usage stats update failed:', error);
    }
  }

  public async manualTeach(input: string, response: string): Promise<void> {
    // Save to local brain
    this.brain.learn(input, response);
    
    // Save to backend if authenticated
    if (this.token) {
      try {
        await fetch('/api/ai/teach', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({
            input,
            response,
            intent: this.classifyIntent(input)
          })
        });
      } catch (error) {
        console.error('Manual teaching failed:', error);
        // Fallback to old method
        await saveMemory(this.token, input, response);
      }
    }
  }

  private classifyIntent(input: string): string {
    const normalized = input.toLowerCase();
    
    if (normalized.includes('time') || normalized.includes('clock')) return 'time_query';
    if (normalized.includes('weather')) return 'weather_query';
    if (normalized.includes('calculate') || normalized.includes('math')) return 'calculation';
    if (normalized.includes('open') || normalized.includes('navigate')) return 'navigation';
    if (['hello', 'hi', 'hey'].some(greeting => normalized.includes(greeting))) return 'greeting';
    
    return 'general';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public setAuthToken(token: string): void {
    this.token = token;
  }

  public async provideFeedback(input: string, response: string, isPositive: boolean): Promise<void> {
    if (!this.token) return;
    
    try {
      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          sessionId: this.generateSessionId(),
          messageIndex: 1, // Assistant response
          rating: isPositive ? 5 : 1,
          correction: isPositive ? null : 'User indicated this response was not helpful'
        })
      });
    } catch (error) {
      console.error('Feedback submission failed:', error);
    }
  }
}