import { useState, useEffect } from 'react';
import { Clock } from '@/components/Clock';
import { Weather } from '@/components/Weather';
import { CommandInput } from '@/components/CommandInput';
import { CommandLog } from '@/components/CommandLog';
import { CommandProcessor } from '@/utils/commandProcessor';

export interface LogEntry {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
}

const Index = () => {
  const [commandLog, setCommandLog] = useState<LogEntry[]>([]);
  const [isListening, setIsListening] = useState(false);

  const addLogEntry = (type: 'user' | 'assistant', message: string) => {
    const entry: LogEntry = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setCommandLog(prev => [...prev, entry]);
  };

  const handleCommand = async (command: string) => {
    addLogEntry('user', command);

    try {
      const response = await CommandProcessor.processCommand(command);
      addLogEntry('assistant', response);

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      const errorMessage = "I encountered an error processing that command.";
      addLogEntry('assistant', errorMessage);
    }
  };

  useEffect(() => {
    const welcomeMessage = "IDIOT system initialized. How can I assist you today?";
    addLogEntry('assistant', welcomeMessage);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-jarvis-dark via-background to-jarvis-dark opacity-50" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(var(--primary)/0.1)_0%,_transparent_50%)]" />

      {/* Top Fixed Components */}
      <div className="fixed top-6 left-6 z-20">
        <Clock />
      </div>
      <div className="fixed top-6 right-6 z-20">
        <Weather />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-28 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            I.D.I.O.T
          </h1>
          <p className="text-muted-foreground text-lg italic">
            I Don’t Obey Orders Instantly Or Thoughtlessly.
          </p>
        </div>

        {/* Command Input */}
        <div className="mb-8">
          <CommandInput
            onCommand={handleCommand}
            isListening={isListening}
            setIsListening={setIsListening}
          />
        </div>

        {/* Command Log */}
        <CommandLog entries={commandLog} />
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-2 bg-black border-t border-gray-700 text-center z-30">
        <p className="text-xs text-gray-400">© dkprivatelimited@21</p>
      </footer>
    </div>
  );
};

export default Index;
