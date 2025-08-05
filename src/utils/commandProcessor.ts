export class CommandProcessor {
  static async processCommand(command: string): Promise<string> {
    const normalized = command.toLowerCase().trim();

    // Time
    if (this.includesAny(normalized, ['time', 'clock'])) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      });
      return `It's currently ${timeString}. Need anything else?`;
    }

    // Date
    if (this.includesAny(normalized, ['date', 'day', 'today'])) {
      const now = new Date();
      const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return `Today is ${dateString}. Hope you're having a good one!`;
    }

    // Open YouTube
    if (this.includesAll(normalized, ['open', 'youtube'])) {
      window.open('https://www.youtube.com', '_blank');
      return 'Taking you to YouTube. Enjoy!';
    }

    // Open Google
    if (this.includesAll(normalized, ['open', 'google'])) {
      window.open('https://www.google.com', '_blank');
      return 'Google is opening now.';
    }

    // Search
    if (this.includesAny(normalized, ['search for', 'look up'])) {
      const match = normalized.match(/(?:search for|look up)\s+(.+)/);
      if (match && match[1]) {
        const topic = match[1];
        return await this.searchWikipedia(topic);
      } else {
        return "What would you like me to search for?";
      }
    }

    // Weather (placeholder)
    if (normalized.includes('weather')) {
      return "I'm still learning to read the weather. For now, try saying 'open Google' and check it there.";
    }

    // Joke
    if (normalized.includes('joke')) {
      const jokes = [
        "Why did the developer go broke? Because he used up all his cache.",
        "Why don’t skeletons fight each other? They don’t have the guts.",
        "What do you call fake spaghetti? An impasta."
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Greetings
    if (this.includesAny(normalized, ['hi', 'hello', 'hey'])) {
      return "Hey there! I'm your assistant. What can I help you with?";
    }

    if (normalized.includes('how are you')) {
      return "I’m doing great, thanks for asking! How about you?";
    }

    if (normalized.includes('goodbye') || normalized.includes('bye')) {
      return "Goodbye! I'm always here if you need anything.";
    }

    // Help
    if (this.includesAny(normalized, ['help', 'commands'])) {
      return `Here's what I can do for you:
      • "What time is it?" – current time
      • "What day is it?" – today's date
      • "Open YouTube" – launch YouTube
      • "Open Google" – launch Google
      • "Search for [topic]" – search Wikipedia
      • "Tell me a joke" – fun joke
      • "Hi / Bye / How are you?" – basic chat`;
    }

    // Unknown
    return `Hmm, I didn’t catch that. Try saying “help” to see what I can do.`;
  }

  private static includesAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private static includesAll(text: string, keywords: string[]): boolean {
    return keywords.every(keyword => text.includes(keyword));
  }

  private static async searchWikipedia(query: string): Promise<string> {
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed');

      const data = await res.json();
      const summary = data.extract || null;

      if (summary) {
        const trimmed = summary.length > 200 ? summary.slice(0, 200) + '...' : summary;
        return `Here’s what I found about ${query}: ${trimmed}`;
      }

      throw new Error('No summary found');
    } catch {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      return `I couldn’t fetch Wikipedia, but I opened a Google search for "${query}".`;
    }
  }
}
