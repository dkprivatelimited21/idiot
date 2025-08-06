// src/core/LearningProcessor.ts
import { MemoryBrain } from './MemoryBrain';
import { CommandProcessor } from '@/utils/commandProcessor';
import { saveMemory, loadMemory, synthesizeSpeech } from '@/api';

export class LearningProcessor {
  private brain: MemoryBrain;
  private hardcoded: CommandProcessor;
  private token: string | null;

  constructor(token: string | null = null) {
    this.brain = new MemoryBrain();
    this.hardcoded = new CommandProcessor();
    this.token = token;
  }

  public async process(input: string): Promise<{text: string; speech?: string}> {
    // Try to load from backend first if authenticated
    if (this.token) {
      try {
        const memory = await loadMemory(this.token);
        const remembered = this.findInMemory(input, memory);
        if (remembered) {
          return {
            text: remembered,
            speech: remembered // Fallback to same text if synthesis fails
          };
        }
      } catch (err) {
        console.error('Failed to load memory:', err);
      }
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
      
      // Save to backend
      try {
        await saveMemory(this.token, input, textResponse);
      } catch (err) {
        console.error('Failed to save memory:', err);
      }
    }
    
    return {
      text: textResponse,
      speech: speechResponse
    };
  }

  private findInMemory(input: string, memory: any): string | null {
    // Implement pattern matching from MemoryBrain
    return this.brain.recall(input);
  }

  public manualTeach(input: string, response: string): void {
    this.brain.learn(input, response);
    if (this.token) {
      saveMemory(this.token, input, response).catch(console.error);
    }
  }

  public setAuthToken(token: string): void {
    this.token = token;
  }
}