
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';

interface AudioPlayerProps {
  text: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synth = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synth.current = window.speechSynthesis;
      setIsSupported(true);
    }
    // Cleanup on unmount
    return () => {
      if (synth.current?.speaking) {
        synth.current.cancel();
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (!synth.current) return;
    if (synth.current.speaking) {
      synth.current.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      synth.current.speak(utterance);
      setIsPlaying(true);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleTogglePlay}
        className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-3 py-1 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
      >
        {isPlaying ? <Icons.UserX className="w-3 h-3 text-red-400" /> : <Icons.Activity className="w-3 h-3 text-cyan-400" />}
        {isPlaying ? 'Stop' : 'Read Aloud'}
      </button>
    </div>
  );
};

export default AudioPlayer;
