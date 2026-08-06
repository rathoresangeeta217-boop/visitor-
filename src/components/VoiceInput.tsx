import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Type } from 'lucide-react';

interface VoiceInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

export function VoiceInput({ label, value, onChangeText, ...props }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Use final transcript if available, otherwise use interim
        const newText = finalTranscript || interimTranscript;
        
        // If it's final, we append to the existing value.
        // For simplicity in a form field, we just replace the value while listening to avoid complex cursor management.
        if (newText) {
          onChangeText(newText.trim());
        }
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onChangeText]);

  const toggleListen = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      // Clear value if starting fresh dictation? Maybe keep it and append? 
      // It's cleaner to let the user clear it manually or just overwrite. We will overwrite.
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-slate-700 ml-1 uppercase tracking-wider">{label}</label>
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400">
          <Type className="w-5 h-5" />
        </div>
        <input
          {...props}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-4 pl-12 pr-16 text-lg font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
        />
        <button
          type="button"
          onClick={toggleListen}
          className={`absolute right-2 p-2 rounded-lg transition-colors ${
            isListening 
              ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-blue-600'
          }`}
          title="Dictate"
        >
          {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
