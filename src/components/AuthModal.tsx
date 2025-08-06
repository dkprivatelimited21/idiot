import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { login, register } from '@/api';

export const AuthModal = ({ 
  open, 
  onClose, 
  onAuthSuccess 
}: {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string) => void;
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = isLogin 
        ? await login(username, password)
        : await register(username, password);
      onAuthSuccess(response.token);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex justify-between">
            <Button type="submit">
              {isLogin ? 'Login' : 'Register'}
            </Button>
            <Button variant="ghost" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Need an account?' : 'Have an account?'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};