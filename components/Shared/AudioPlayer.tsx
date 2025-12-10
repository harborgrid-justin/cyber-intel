
import React, { useState, useEffect, useRef } from 'react';

interface AudioPlayerProps {
  text: string;
  autoPlay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(false);
  const synth = useRef<SpeechSynthesis | null>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synth.current = window.speechSynthesis;
      setSupported(true);
    }
    
    // Cleanup function
    return () => {
        if (synth.current) {
            synth.current.cancel();
        }
    };
  }, []);

  const togglePlay = () => {
    if (!synth.current) return;

    if (isPlaying) {
      synth.current.cancel();
      setIsPlaying(false);
    } else {
      utterance.current = new SpeechSynthesisUtterance(text);
      utterance.current.rate = 1.1;
      utterance.current.pitch = 0.9; // Lower pitch for "AI" feel
      
      // Select a decent voice
      const voices = synth.current.getVoices();
      const preferred = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
      if (preferred) utterance.current.voice = preferred;

      utterance.current.onend = () => setIsPlaying(false);
      utterance.current.onerror = () => setIsPlaying(false);
      
      synth.current.speak(utterance.current);
      setIsPlaying(true);
    }
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-3 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
      <button 
        onClick={togglePlay}
        className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${isPlaying ? 'bg-cyan-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
      >
        {isPlaying ? (
          <span className="block w-2 h-2 bg-white rounded-sm" />
        ) : (
          <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        )}
      </button>
      
      {/* Fake Visualizer */}
      <div className="flex gap-0.5 items-end h-3">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className={`w-1 rounded-t-sm bg-cyan-500/50 transition-all duration-100 ${isPlaying ? 'animate-[bounce_1s_infinite]' : 'h-1'}`}
            style={{ 
              height: isPlaying ? `${Math.random() * 100}%` : '20%',
              animationDelay: `${i * 0.1}s` 
            }}
          />
        ))}
      </div>
      
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
        {isPlaying ? 'TRANSMITTING' : 'PLAY BRIEF'}
      </span>
    </div>
  );
};

export default AudioPlayer;
