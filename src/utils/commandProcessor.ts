export class CommandProcessor {
  static async processCommand(command: string): Promise<string> {
    const normalizedCommand = command.toLowerCase().trim();

    // Time commands
    if (normalizedCommand.includes('time') || normalizedCommand.includes('clock')) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit'
      });
      return `The current time is ${timeString}.`;
    }

    // Date commands
    if (normalizedCommand.includes('date') || normalizedCommand.includes('day') || normalizedCommand.includes('today')) {
      const now = new Date();
      const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return `Today is ${dateString}.`;
    }

    // Open YouTube
    if (normalizedCommand.includes('open youtube') || normalizedCommand.includes('youtube')) {
      window.open('https://www.youtube.com', '_blank');
      return 'Opening YouTube in a new tab.';
    }

    // Open Google
    if (normalizedCommand.includes('open google') || (normalizedCommand.includes('google') && normalizedCommand.includes('open'))) {
      window.open('https://www.google.com', '_blank');
      return 'Opening Google in a new tab.';
    }

    // Search commands
    if (normalizedCommand.includes('search for') || normalizedCommand.includes('look up')) {
      const searchTermMatch = normalizedCommand.match(/(?:search for|look up)\s+(.+)/);
      if (searchTermMatch) {
        const searchTerm = searchTermMatch[1];
        try {
          const response = await this.searchWikipedia(searchTerm);
          return response;
        } catch (error) {
          return `I couldn't find information about "${searchTerm}" right now. Let me open a Google search instead.`;
        }
      }
    }

    // Weather (basic response since we don't have an API)
    if (normalizedCommand.includes('weather')) {
      return "I don't have access to current weather data yet. You can check the weather by saying 'Open Google' and searching for weather.";
    }

    // Help command
    if (normalizedCommand.includes('help') || normalizedCommand.includes('commands')) {
      return `I can help you with these commands:
      • "What time is it?" - Get current time
      • "What day is it?" - Get current date
      • "Open YouTube" - Open YouTube
      • "Open Google" - Open Google
      • "Search for [topic]" - Search Wikipedia
      • "Help" - Show this message`;
    }

    // Default response for unrecognized commands
    return `I'm not sure how to handle that command. Try saying "help" to see what I can do.`;
  }

  private static async searchWikipedia(query: string): Promise<string> {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Wikipedia search failed');
      }
      
      const data = await response.json();
      
      if (data.extract) {
        // Limit the response to first 200 characters for speech
        const summary = data.extract.length > 200 
          ? data.extract.substring(0, 200) + '...' 
          : data.extract;
        return `Here's what I found about ${query}: ${summary}`;
      } else {
        throw new Error('No content found');
      }
    } catch (error) {
      // Fallback to Google search
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      return `I couldn't access Wikipedia, but I've opened a Google search for "${query}".`;
    }
  }
}