// src/core/LearningProcessor.ts
class LearningProcessor {
  private brain: MemoryBrain;
  private hardcoded: CommandProcessor; // Your existing processor

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

  public manualTeach(input: string, response: string): void {
    this.brain.learn(input, response);
  }
}