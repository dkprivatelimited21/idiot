import { useState, useEffect, useRef } from 'react';
import { Clock } from '@/components/Clock';
import { Weather } from '@/components/Weather';
import { CommandInput } from '@/components/CommandInput';
import { CommandLog } from '@/components/CommandLog';
import { LearningProcessor } from '@/core/LearningProcessor';
import { ThumbsUp, ThumbsDown, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpeechSynthesizer } from '@/utils/speech';

export interface LogEntry {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  userInput?: string;
}

const Index = () => {
  const [commandLog, setCommandLog] = useState<LogEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const learningProcessor = useRef(new LearningProcessor());
  const synthesizer = useRef(SpeechSynthesizer.getInstance());
  const logEndRef = useRef<HTMLDivElement>(null);
const [authToken, setAuthToken] = useState<string | null>(null);
const [showAuthModal, setShowAuthModal] = useState(false);

// Add this useEffect to check for existing token
useEffect(() => {
  const token = localStorage.getItem('jarvis_token');
  if (token) {
    setAuthToken(token);
    learningProcessor.current.setAuthToken(token);
  }
}, []);

useEffect(() => {
  if (authToken) {
    learningProcessor.current.setAuthToken(authToken);
  }
}, [authToken]);





  // Initialize with welcome message
  useEffect(() => {
    if (commandLog.length === 0) {
      const welcomeMessages = [
        "Systems online. How may I assist you today?",
        "Boot sequence complete. Ready to serve.",
        "All systems operational. Awaiting your command."
      ];
      const welcomeMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      addLogEntry('assistant', welcomeMessage);
      synthesizer.current.speak(welcomeMessage);
    }
  }, []);

  // Auto-scroll to bottom of log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commandLog]);

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

// Add this function
const handleAuthSuccess = (token: string) => {
  localStorage.setItem('jarvis_token', token);
  setAuthToken(token);
  setShowAuthModal(false);
  addLogEntry('assistant', "Authentication successful. Memory persistence enabled.");
};

  const handleCommand = async (command: string) => {
  addLogEntry('user', command);
  setIsProcessing(true);
  
  try {
    const { text, speech } = await learningProcessor.current.process(command);
    addLogEntry('assistant', text, command);
    
    // Speak the response
    synthesizer.current.speak(speech || text, {
      rate: 1.1,
      pitch: 0.9,
      voice: 'Google US English'
    });

    // Add visual feedback for backend errors
  } catch (error: any) {
    const errorMessage = error.message || "I encountered an error processing that command.";
    addLogEntry('assistant', errorMessage);
    synthesizer.current.speak(errorMessage);
    
    if (error.message.includes('authentication')) {
      // Prompt user to login if auth error
      localStorage.removeItem('jarvis_token');
      setAuthToken(null);
    }
  } finally {
    setIsProcessing(false);
  }
};
  const handleFeedback = (entryId: string, correct: boolean) => {
    const entry = commandLog.find(e => e.id === entryId);
    if (!entry || !entry.userInput) return;

    if (correct) {
      learningProcessor.current.manualTeach(entry.userInput, entry.message);
    } else {
      const betterResponse = prompt("How should I have responded?", entry.message);
      if (betterResponse && betterResponse.trim() !== entry.message) {
        learningProcessor.current.manualTeach(entry.userInput, betterResponse.trim());
        updateLogEntry(entryId, betterResponse.trim());
      }
    }
  };

  const updateLogEntry = (id: string, newMessage: string) => {
    setCommandLog(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, message: newMessage } : entry
      )
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-background to-purple-900/20 opacity-70" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      
      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 pt-8 pb-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 animate-pulse-slow">
            J.A.R.V.I.S
          </h1>
          <p className="text-muted-foreground text-lg italic">
            Just A Rather Very Intelligent System
          </p>
          <div className="flex justify-center mt-4 space-x-6">
            <Clock />
            <Weather />
          </div>
        </div>

        {/* Command Log */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden mb-6">
          <div className="p-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent">
            {commandLog.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No commands yet. Try saying "What time is it?" or "Open Google"
              </div>
            ) : (
              <div className="space-y-4">
                {commandLog.map((entry) => (
                  <div key={entry.id} className={`flex items-start space-x-3 ${entry.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {entry.type === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Bot size={16} className="text-primary-foreground" />
                      </div>
                    )}
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      entry.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      <p className="text-sm">{entry.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(entry.timestamp)}
                      </p>
                      {entry.type === 'assistant' && (
                        <div className="flex gap-2 mt-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleFeedback(entry.id, true)}>
                            <ThumbsUp size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleFeedback(entry.id, false)}>
                            <ThumbsDown size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                    {entry.type === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                        <User size={16} className="text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Command Input */}
        <div className="mt-6 bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30">
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

        {/* System status */}
        <footer className="mt-6 text-center text-sm text-muted-foreground/70">
          <div className="flex items-center justify-center space-x-4">
            <span className={`inline-block w-2 h-2 rounded-full ${
              isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`}></span>
            <span>JARVIS v2.1 - {isProcessing ? 'Processing' : 'Active'}</span>
          </div>
        </footer>
<AuthModal 
  open={showAuthModal}
  onClose={() => setShowAuthModal(false)}
  onAuthSuccess={handleAuthSuccess}
/>
      </div>
    </div>
  );
};

export default Index;