// src/core/LearningProcessor.ts
import { MemoryBrain } from './MemoryBrain';
import { CommandProcessor } from '@/utils/commandProcessor';

export class LearningProcessor {
  private brain: MemoryBrain;
  private hardcoded: CommandProcessor;

  constructor() {
    this.brain = new MemoryBrain();
    this.hardcoded = new CommandProcessor();
  }

  public async process(input: string): Promise<string> {
    // First try recalling learned response
    const remembered = this.brain.recall(input);
    if (remembered) return remembered;

    // Fallback to hardcoded commands
    const hardcodedResponse = await this.hardcoded.processCommand(input);
    
    // Learn from this interaction
    this.brain.learn(input, hardcodedResponse);
    
    return hardcodedResponse;
  }

  public manualTeach(input: string, response: string, positiveReinforcement: boolean = true): void {
    this.brain.learn(input, response);
    
    // Additional reinforcement for positive feedback
    if (positiveReinforcement) {
      this.brain.boostConfidence(input, 0.2); // Boost confidence more for manual corrections
    }
  }

  // Additional helper method
  public getMemorySnapshot(): Record<string, any> {
    return this.brain.getMemorySnapshot();
  }
}

// Optional: Export a default instance
const defaultProcessor = new LearningProcessor();
export default defaultProcessor;