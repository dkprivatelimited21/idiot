import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';
import { initializeAuth } from './api';
import { SpeechSynthesizer } from './utils/speech';

// Initialize critical services before app renders
function initializeServices() {
  // 1. Set up authentication tokens from storage
  initializeAuth();
  
  // 2. Preload speech synthesizer voices
  SpeechSynthesizer.getInstance().loadVoices();
  
  // 3. Set up error tracking (example with console)
  if (process.env.NODE_ENV === 'production') {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('Global error:', { message, source, lineno, error });
      // In production, you'd send this to an error tracking service
    };
  }
}

// Initialize services before rendering
initializeServices();

// Create root and render app
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);
root.render(<App />);

// Register service worker in production
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}