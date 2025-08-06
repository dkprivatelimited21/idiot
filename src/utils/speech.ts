// src/utils/speech.ts
export class SpeechSynthesizer {
  private static instance: SpeechSynthesizer;
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private voiceReady: Promise<void>;

  private constructor() {
    this.synth = window.speechSynthesis;
    this.voiceReady = this.loadVoices();
  }

  public static getInstance(): SpeechSynthesizer {
    if (!SpeechSynthesizer.instance) {
      SpeechSynthesizer.instance = new SpeechSynthesizer();
    }
    return SpeechSynthesizer.instance;
  }

  private async loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        this.voices = voices;
        resolve();
      } else {
        this.synth.onvoiceschanged = () => {
          this.voices = this.synth.getVoices();
          resolve();
        };
      }
    });
  }

  public async speak(text: string, options: {
    rate?: number;
    pitch?: number;
    voice?: string;
  } = {}): Promise<void> {
    await this.voiceReady;
    this.synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.1;
    utterance.pitch = options.pitch || 1.0;
    
    if (options.voice) {
      const voice = this.voices.find(v => v.name.includes(options.voice!));
      if (voice) utterance.voice = voice;
    }
    
    this.synth.speak(utterance);
  }
}