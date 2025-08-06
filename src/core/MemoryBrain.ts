// src/core/MemoryBrain.ts
class MemoryBrain {
  private knowledge: Map<string, { response: string; confidence: number }>;
  private conversations: string[];
  private patterns: Map<string, string[]>;

  constructor() {
    this.knowledge = new Map();
    this.conversations = [];
    this.patterns = new Map();
    this.loadFromLocalStorage();
  }

  public learn(input: string, response: string): void {
    // Store the conversation
    this.conversations.push(`${input} → ${response}`);
    
    // Analyze and extract patterns
    this.analyzePatterns(input, response);
    
    // Update knowledge base
    const key = input.toLowerCase().trim();
    if (this.knowledge.has(key)) {
      const existing = this.knowledge.get(key)!;
      existing.confidence += 0.1;
      this.knowledge.set(key, existing);
    } else {
      this.knowledge.set(key, { response, confidence: 0.5 });
    }
    
    this.saveToLocalStorage();
  }

  private analyzePatterns(input: string, response: string): void {
    const words = input.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      if (word.length > 3) { // Ignore short words
        if (!this.patterns.has(word)) {
          this.patterns.set(word, []);
        }
        const responses = this.patterns.get(word)!;
        if (!responses.includes(response)) {
          responses.push(response);
        }
      }
    });
  }

  public recall(input: string): string | null {
    const exactMatch = this.knowledge.get(input.toLowerCase().trim());
    if (exactMatch && exactMatch.confidence > 0.7) {
      return exactMatch.response;
    }

    // Fuzzy matching based on learned patterns
    const words = input.toLowerCase().split(/\s+/);
    const possibleResponses: Record<string, number> = {};

    words.forEach(word => {
      if (this.patterns.has(word)) {
        this.patterns.get(word)!.forEach(response => {
          possibleResponses[response] = (possibleResponses[response] || 0) + 1;
        });
      }
    });

    if (Object.keys(possibleResponses).length > 0) {
      const bestResponse = Object.entries(possibleResponses).sort((a, b) => b[1] - a[1])[0];
      return bestResponse[0];
    }

    return null;
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('jarvisMemory', JSON.stringify({
      knowledge: Array.from(this.knowledge.entries()),
      conversations: this.conversations,
      patterns: Array.from(this.patterns.entries())
    }));
  }

  private loadFromLocalStorage(): void {
    const saved = localStorage.getItem('jarvisMemory');
    if (saved) {
      const data = JSON.parse(saved);
      this.knowledge = new Map(data.knowledge);
      this.conversations = data.conversations;
      this.patterns = new Map(data.patterns);
    }
  }
}
 public findSimilarQuestions(input: string): string[] {
    const inputWords = new Set(input.toLowerCase().split(/\s+/));
    const similar: string[] = [];
    
    this.knowledge.forEach((_, key) => {
      const keyWords = new Set(key.split(/\s+/));
      const intersection = new Set([...inputWords].filter(x => keyWords.has(x)));
      if (intersection.size / inputWords.size > 0.6) {
        similar.push(key);
      }
    });
    
    return similar;
  }

  public autoGenerateResponses(input: string): string[] {
    const similar = this.findSimilarQuestions(input);
    return similar.map(q => this.knowledge.get(q)!.response);
  }
}
