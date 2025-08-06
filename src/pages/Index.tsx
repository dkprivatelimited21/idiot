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
      const speak = () => {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.rate = 1.3;
        utterance.pitch = 1.0;
        utterance.volume = 1;
        utterance.lang = "en-US";

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          utterance.voice = voices.find(v => v.lang === 'en-US') || voices[0];
          speechSynthesis.speak(utterance);
        } else {
          setTimeout(speak, 200);
        }
      };

      window.speechSynthesis.cancel();
      speak();
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

     <div className="flex justify-between items-start mb-8 px-4">
  <Clock />
  <Weather />
</div>
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-16 pb-20 max-w-4xl">



        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            I.D.I.O.T
          </h1>
          <p className="text-muted-foreground text-lg italic">
            I Don’t Obey Orders Instantly Or Thoughtlessly.
          </p>
        </div>


 {/* Command Log */}
        <CommandLog entries={commandLog} />


        {/* Command Input */}
        <div className="mt-6"> {/* mt-6 = margin-top for spacing */}
          <CommandInput
            onCommand={handleCommand}
            isListening={isListening}
            setIsListening={setIsListening}
          />
        </div>

       
      </div>

      {/* Footer */}
     <footer className="mt-16 py-4 text-center text-gray-400 text-sm">
  © dkprivatelimited@21
</footer>

    </div>
  );
};

export default Index;
