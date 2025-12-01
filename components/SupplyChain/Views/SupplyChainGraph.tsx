
import React from 'react';
import { Vendor } from '../../../types';
import { Card, CardHeader } from '../../Shared/UI';

interface Props {
  vendors: Vendor[];
}

export const SupplyChainGraph: React.FC<Props> = ({ vendors }) => {
  return (
    <div className="h-full bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex flex-col">
        <CardHeader title="N-Tier Dependency Map" />
        <div className="absolute top-14 left-4 z-10 bg-slate-900/80 p-2 rounded border border-slate-700">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Supply Chain Depth</div>
            <div className="text-lg font-bold text-white">Tier 1 → Tier 4</div>
        </div>
        
        <div className="flex-1 relative">
            <svg className="w-full h-full absolute inset-0">
                <defs>
                    <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#334155" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#334155" stopOpacity="0.8" />
                    </linearGradient>
                </defs>
                {/* Central Node */}
                <circle cx="50%" cy="50%" r="35" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" className="drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
                <text x="50%" y="50%" dy="5" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">SENTINEL</text>

                {/* Vendor Nodes */}
                {vendors.map((v, i) => {
                    const count = vendors.length;
                    const angle = (i / count) * 2 * Math.PI;
                    const radius = 35; // %
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);
                    
                    const isHighRisk = v.riskScore > 75;
                    const riskColor = isHighRisk ? '#ef4444' : '#22c55e';

                    return (
                        <g key={v.id} className="cursor-pointer hover:opacity-80 transition-opacity">
                            {/* Connection Line */}
                            <line x1="50%" y1="50%" x2={`${x}%`} y2={`${y}%`} stroke="url(#linkGradient)" strokeWidth="1" />
                            
                            {/* Outer Node */}
                            <circle cx={`${x}%`} cy={`${y}%`} r="18" fill="#1e293b" stroke={riskColor} strokeWidth={isHighRisk ? 3 : 1} className={isHighRisk ? 'animate-pulse' : ''} />
                            
                            {/* Label */}
                            <text x={`${x}%`} y={`${y}%`} dy="4" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="bold">
                                {v.name.substring(0, 3).toUpperCase()}
                            </text>
                            
                            {/* Subcontractor Nodes (Simulated) */}
                            {v.subcontractors.length > 0 && (
                                <line x1={`${x}%`} y1={`${y}%`} x2={`${x + (Math.cos(angle)*10)}%`} y2={`${y + (Math.sin(angle)*10)}%`} stroke="#475569" strokeWidth="0.5" strokeDasharray="2,2" />
                            )}
                            {v.subcontractors.length > 0 && (
                                <circle cx={`${x + (Math.cos(angle)*10)}%`} cy={`${y + (Math.sin(angle)*10)}%`} r="5" fill="#0f172a" stroke="#64748b" />
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
        
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="w-3 h-3 rounded-full border border-red-500 bg-slate-900"></span> High Risk
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="w-3 h-3 rounded-full border border-green-500 bg-slate-900"></span> Stable
            </div>
        </div>
    </div>
  );
};
