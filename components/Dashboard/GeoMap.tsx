import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '../Shared/UI';
import { Threat } from '../../types';
import { GeoLogic } from '../../services/logic/dashboard/CoreLogic';
import { IntersectionPruner } from '../Shared/IntersectionPruner';
import { TOKENS } from '../../styles/theme';

interface GeoMapProps {
  threats?: Threat[];
  fullScreen?: boolean;
}

const GeoMapContent: React.FC<GeoMapProps> = ({ threats = [], fullScreen = false }) => {
  const attacks = useMemo(() => {
    return GeoLogic.generateAttackVectors(threats).map(atk => {
        const severity = atk.severity.toLowerCase();
        return { ...atk, color: `var(--colors-${severity})` };
    });
  }, [threats]);
  const [regionalRisk, setRegionalRisk] = useState<[string, number][]>([]);

  useEffect(() => { if (fullScreen) { GeoLogic.getRegionalRisk().then(setRegionalRisk); } }, [fullScreen]);

  return (
    <Card className={`p-0 relative overflow-hidden group bg-slate-950 border-[var(--colors-borderDefault)] ${fullScreen ? 'h-full' : 'h-full'}`}>
      {!fullScreen && <h3 className="text-sm font-bold text-[var(--colors-textSecondary)] uppercase tracking-widest mb-4 absolute top-6 left-6 z-10">Global Threat Origins</h3>}
      {fullScreen && ( <div className="absolute top-4 right-4 z-20 bg-slate-900/90 p-4 rounded border border-[var(--colors-borderDefault)] w-64 backdrop-blur"> <h4 className="text-xs font-bold text-white uppercase mb-2">Regional Risk Index</h4> <div className="space-y-2"> {regionalRisk.map(([region, score]) => ( <div key={region} className="flex justify-between text-xs"> <span className="text-[var(--colors-textSecondary)]">{region}</span> <span className={`font-mono font-bold ${score > 50 ? 'text-[var(--colors-error)]' : 'text-[var(--colors-warning)]'}`}>{score.toFixed(0)}</span> </div> ))} </div> </div> )}
      <div className="absolute inset-0 opacity-20 grid grid-cols-12 grid-rows-6 gap-1 p-4 pointer-events-none">{Array.from({ length: 72 }).map((_, i) => ( <div key={i} className="border border-[var(--colors-primary)]/10 rounded-sm"></div> ))}</div>
      <svg className="w-full h-full text-slate-700" fill="currentColor" viewBox="0 0 100 50" preserveAspectRatio="none">
        <path d="M20,10 Q30,5 40,12 T60,10 T80,15 T90,30 L85,40 H60 L50,30 L30,35 L20,40 Z" opacity="0.2" />
        {attacks.map((atk, i) => ( <g key={i}><line x1={atk.source.x} y1={atk.source.y} x2={atk.target.x} y2={atk.target.y} stroke={atk.color} strokeWidth="0.2" opacity="0.6" strokeDasharray="2"><animate attributeName="stroke-dashoffset" from="100" to="0" dur={`${2 + Math.random()}s`} repeatCount="indefinite" /></line><circle cx={atk.source.x} cy={atk.source.y} r="1" fill={atk.color} className="animate-ping" opacity="0.8" style={{ animationDuration: '3s' }} /></g>))}
        <circle cx="25" cy="15" r="1.5" fill="#ffffff" stroke="var(--colors-primary)" strokeWidth="0.5" />
      </svg>
      {!fullScreen && ( <div className="absolute bottom-6 left-6 text-xs text-[var(--colors-textTertiary)] font-mono"><div>LIVE FEED: {threats.length} NODES</div></div> )}
    </Card>
  );
};

const GeoMap: React.FC<GeoMapProps> = (props) => ( <IntersectionPruner height="100%"><GeoMapContent {...props} /></IntersectionPruner> );
export default GeoMap;
