
import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';

export const DarkWebTerminal: React.FC = () => {
  const [lines, setLines] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Fetch stream source from central store
  const sourceStream = threatData.getDarkWebStream();

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setLines(prev => [...prev, sourceStream[index % sourceStream.length]]);
      index++;
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="flex-1 bg-black border-slate-800 font-mono text-xs p-0 overflow-hidden flex flex-col h-full shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <div className="bg-[#1a1a1a] p-2 border-b border-[#333] flex justify-between items-center">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
        <div className="text-[10px] text-green-500 uppercase tracking-widest font-bold">TOR_BRIDGE_ACTIVE</div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-1 relative" ref={scrollRef}>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
        {lines.map((l, i) => (
          <div key={i} className={`
            ${l.includes('Warning') || l.includes('Alert') ? 'text-red-500 font-bold bg-red-900/10' : 'text-green-500/80'}
            ${l.includes('CONNECTING') ? 'text-yellow-500' : ''}
          `}>
            <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
            {l}
          </div>
        ))}
        <div className="animate-pulse text-green-500">_</div>
      </div>
    </Card>
  );
};
