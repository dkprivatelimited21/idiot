import { useState, useEffect, useRef } from 'react';
import { Clock } from '@/components/Clock';
import { Weather } from '@/components/Weather';
import { CommandInput } from '@/components/CommandInput';
import { CommandLog } from '@/components/CommandLog';
import { LearningProcessor } from '@/core/LearningProcessor';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface LogEntry {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  userInput?: string; // Track which user input led to this response
}

const Index = () => {
  const [commandLog, setCommandLog] = useState<LogEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const learningProcessor = useRef(new LearningProcessor());
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessages = [
      "IDIOT systems online. How may I assist you today?",
      "Boot sequence complete. Ready to serve.",
      "All systems operational. Awaiting your command."
    ];
    const welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    addLogEntry('assistant', welcomeMessage);
  }, []);

  const addLogEntry = (type: 'user' | 'assistant', message: string, userInput?: string) => {
    const entry: LogEntry = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      userInput
    };
    setCommandLog(prev => [...prev, entry]);
  };

  const updateLogEntry = (id: string, newMessage: string) => {
    setCommandLog(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, message: newMessage } : entry
      )
    );
  };

  const handleCommand = async (command: string) => {
    addLogEntry('user', command);
    setIsProcessing(true);
    
    try {
      const response = await learningProcessor.current.process(command);
      addLogEntry('assistant', response, command);
      
      // Speak the response
      if ('speechSynthesis' in window) {
        const speak = () => {
          const utterance = new SpeechSynthesisUtterance(response);
          utterance.rate = 1.1;
          utterance.pitch = 0.9;
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
      addLogEntry('assistant', "My neural networks encountered an error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeedback = (entryId: string, correct: boolean) => {
    const entry = commandLog.find(e => e.id === entryId);
    if (!entry || !entry.userInput) return;

    if (correct) {
      // Positive reinforcement
      learningProcessor.current.manualTeach(
        entry.userInput, 
        entry.message,
        true
      );
    } else {
      // Learn correction
      const betterResponse = prompt("How should I have responded?", entry.message);
      if (betterResponse && betterResponse.trim() !== entry.message) {
        learningProcessor.current.manualTeach(
          entry.userInput, 
          betterResponse.trim(),
          false
        );
        updateLogEntry(entryId, betterResponse.trim());
      }
    }
  };

  const findUserInputForResponse = (responseId: string): string => {
    const responseIndex = commandLog.findIndex(e => e.id === responseId);
    if (responseIndex > 0) {
      const prevEntry = commandLog[responseIndex - 1];
      if (prevEntry.type === 'user') {
        return prevEntry.message;
      }
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Enhanced futuristic background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-background to-purple-900/20 opacity-70" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      
      {/* Header with animated elements */}
      <div className="relative z-10 container mx-auto px-4 pt-8 pb-12 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 animate-pulse-slow">
            I.D.I.O.T
          </h1>
          <p className="text-muted-foreground text-lg italic">
           I Don’t Obey Orders Instantly Or Thoughtlessly.
          </p>
          <div className="flex justify-center mt-4 space-x-6">
            <Clock />
            <Weather />
          </div>
        </div>

        {/* Command Log with feedback system */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden">
          <CommandLog 
            entries={commandLog} 
            onFeedback={handleFeedback}
            isProcessing={isProcessing}
          />
        </div>

        {/* Enhanced Command Input */}
        <div className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
          <CommandInput
            onCommand={handleCommand}
            isListening={isListening}
            setIsListening={setIsListening}
            isProcessing={isProcessing}
          />
          <div className="text-xs text-muted-foreground mt-2 text-center">
            {isListening ? (
              <span className="text-blue-400">Voice input active</span>
            ) : (
              <span>Type or click the mic to speak</span>
            )}
          </div>
        </div>

        {/* System status footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground/70">
          <div className="flex items-center justify-center space-x-4">
            <span className={`inline-block w-2 h-2 rounded-full ${
              isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`}></span>
            <span>I.D.I.O.T v2.1 - Neural Network: {isProcessing ? 'Processing' : 'Active'}</span>
          </div>
          <div className="mt-2">Learning Mode: Autonomous</div>
        </footer>
      </div>
    </div>
  );
};

export default Index;