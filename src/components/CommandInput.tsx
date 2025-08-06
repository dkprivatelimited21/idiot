import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send } from 'lucide-react';

interface CommandInputProps {
  onCommand: (command: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export const CommandInput = ({ onCommand, isListening, setIsListening }: CommandInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
  const transcript = event.results[0][0].transcript;
  setInputValue('');
  onCommand(transcript.trim()); // 🔥 Execute directly
  setIsListening(false);
};


      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [setIsListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onCommand(inputValue.trim());
      setInputValue('');
    }
  };

  const toggleListening = () => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Enter command or use voice input..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pr-12 bg-card border-border focus:border-primary focus:ring-primary transition-all duration-300"
          />
          {speechSupported && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleListening}
              className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${
                isListening 
                  ? 'text-destructive animate-pulse-glow' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </Button>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={!inputValue.trim()}
          className="bg-primary hover:bg-primary-glow text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Send size={16} />
        </Button>
      </form>
      
      {isListening && (
        <div className="text-center mt-4 text-primary animate-fade-in">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="ml-2">Listening...</span>
          </div>
        </div>
      )}
    </div>
  );
};