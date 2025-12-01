
import React from 'react';
import { Card } from '../Shared/UI';
import { Threat } from '../../types';

interface GeoMapProps {
  threats?: Threat[];
}

const REGION_COORDS: Record<string, { x: number, y: number }> = {
  'NA': { x: 25, y: 15 },
  'SA': { x: 30, y: 35 },
  'EU': { x: 52, y: 12 },
  'AFRICA': { x: 55, y: 25 },
  'ASIA': { x: 75, y: 18 },
  'APAC': { x: 85, y: 32 },
  'Global': { x: 50, y: 45 }, // Antarctica/Ocean for generic
  'LATAM': { x: 28, y: 28 },
  'Dark Web': { x: 10, y: 40 }, // Abstract corner
  'Internal': { x: 90, y: 10 } // Abstract corner
};

const GeoMap: React.FC<GeoMapProps> = ({ threats = [] }) => {
  // Aggregate threats by region for visualization
  const regionCounts: Record<string, number> = {};
  threats.forEach(t => {
    const r = t.region || 'Global';
    regionCounts[r] = (regionCounts[r] || 0) + 1;
  });

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
        
        {/* Dynamic Threat Pings */}
        {Object.entries(regionCounts).map(([region, count], i) => {
          const coords = REGION_COORDS[region] || REGION_COORDS['Global'];
          // Jitter slightly for visual interest if needed, or scale radius by count
          const radius = Math.min(3, 1 + Math.log(count || 1));
          
          return (
            <g key={region}>
              <circle 
                cx={coords.x} 
                cy={coords.y} 
                r={radius} 
                className="text-red-500 animate-ping" 
                style={{ animationDuration: `${2 + Math.random()}s` }} 
                opacity="0.7" 
              />
              <circle 
                cx={coords.x} 
                cy={coords.y} 
                r={radius * 0.5} 
                className="text-red-400" 
              />
            </g>
          );
        })}
        
        {threats.length === 0 && (
           <text x="50" y="25" textAnchor="middle" fill="#475569" fontSize="3" className="uppercase tracking-widest">No Active Signals</text>
        )}
      </svg>
      
      <div className="absolute bottom-6 left-6 text-xs text-slate-500 font-mono">
        <div>LIVE FEED: {threats.length} NODES</div>
      </div>
    </Card>
  );
};
export default GeoMap;
