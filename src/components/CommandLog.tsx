import { useEffect, useRef } from 'react';
import { LogEntry } from '@/pages/Index';
import { User, Bot } from 'lucide-react';

interface CommandLogProps {
  entries: LogEntry[];
}

export const CommandLog = ({ entries }: CommandLogProps) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-primary">Command Log</h2>
      <div className="bg-card border border-border rounded-lg p-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent">
        {entries.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No commands yet. Try saying "What time is it?" or "Open Google"
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className={`flex items-start space-x-3 animate-fade-in ${
                  entry.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {entry.type === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot size={16} className="text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    entry.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm">{entry.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(entry.timestamp)}
                  </p>
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
  );
};