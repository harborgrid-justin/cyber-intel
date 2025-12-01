
import React from 'react';
import { Card } from '../Shared/UI';

const GeoMap: React.FC = () => {
  // Abstract representation of a map for UI constraints
  return (
    <Card className="p-6 h-full relative overflow-hidden group">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 absolute top-6 left-6 z-10">Global Threat Origins</h3>
      
      {/* Abstract Map Grid */}
      <div className="absolute inset-0 opacity-20 grid grid-cols-12 grid-rows-6 gap-1 p-4 pointer-events-none">
        {Array.from({ length: 72 }).map((_, i) => (
          <div key={i} className="border border-cyan-900/30 rounded-sm"></div>
        ))}
      </div>

      <svg className="w-full h-full text-slate-700" fill="currentColor" viewBox="0 0 100 50">
        {/* Simplified World Shapes */}
        <path d="M20,10 Q30,5 40,12 T60,10 T80,15 T90,30 L85,40 H60 L50,30 L30,35 L20,40 Z" opacity="0.3" />
        
        {/* Threat Pings */}
        <circle cx="25" cy="15" r="1.5" className="text-red-500 animate-ping" />
        <circle cx="25" cy="15" r="0.5" className="text-red-400" />
        
        <circle cx="65" cy="12" r="1.5" className="text-orange-500 animate-ping" style={{ animationDelay: '0.5s' }} />
        <circle cx="65" cy="12" r="0.5" className="text-orange-400" />

        <circle cx="55" cy="25" r="1.5" className="text-yellow-500 animate-ping" style={{ animationDelay: '1s' }} />
        <circle cx="55" cy="25" r="0.5" className="text-yellow-400" />
      </svg>
      
      <div className="absolute bottom-6 left-6 text-xs text-slate-500 font-mono">
        <div>LAT: 45.213 N</div>
        <div>LON: 12.331 W</div>
      </div>
    </Card>
  );
};
export default GeoMap;
    