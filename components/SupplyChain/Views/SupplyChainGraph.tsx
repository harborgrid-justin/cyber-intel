
import React from 'react';
import { Vendor } from '../../../types';
import { Card, CardHeader } from '../../Shared/UI';
import { TOKENS } from '../../../styles/theme';

interface Props {
  vendors: Vendor[];
}

export const SupplyChainGraph: React.FC<Props> = ({ vendors }) => {
  const theme = TOKENS.dark;

  return (
    <div className="h-full bg-[var(--colors-surfaceSubtle)] border border-[var(--colors-borderDefault)] rounded-xl relative overflow-hidden flex flex-col">
        <CardHeader title="N-Tier Dependency Map" />
        <div className="absolute top-14 left-4 z-10 bg-[var(--colors-surfaceDefault)] p-2 rounded border border-[var(--colors-borderSubtle)] shadow-lg">
            <div className="text-[10px] font-bold text-[var(--colors-textSecondary)] uppercase">Supply Chain Depth</div>
            <div className="text-lg font-bold text-[var(--colors-textPrimary)]">Tier 1 → Tier 3</div>
        </div>
        
        <div className="flex-1 relative cursor-grab active:cursor-grabbing">
            <svg className="w-full h-full absolute inset-0">
                <defs>
                    <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={theme.graph.link} stopOpacity="0.1" />
                        <stop offset="100%" stopColor={theme.graph.link} stopOpacity="0.6" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                </defs>
                
                {/* Central Node: Organization */}
                <circle cx="50%" cy="50%" r="40" fill="#0f172a" stroke={theme.colors.primary} strokeWidth="3" filter="url(#glow)" />
                <text x="50%" y="50%" dy="4" textAnchor="middle" fill={theme.colors.primary} fontSize="10" fontWeight="900" className="pointer-events-none">SENTINEL</text>

                {/* Vendor Nodes Ring */}
                {vendors.map((v, i) => {
                    const count = vendors.length;
                    const angle = (i / count) * 2 * Math.PI - (Math.PI/2); // Start top
                    const radiusX = 35; // %
                    const radiusY = 30; // %
                    
                    const x = 50 + radiusX * Math.cos(angle);
                    const y = 50 + radiusY * Math.sin(angle);
                    
                    const isHighRisk = v.riskScore > 75;
                    const riskColor = isHighRisk ? theme.colors.alert : v.riskScore > 40 ? theme.colors.secondary : theme.colors.success;

                    return (
                        <g key={v.id} className="cursor-pointer hover:opacity-100 opacity-90 transition-opacity group">
                            {/* Link */}
                            <path d={`M 50% 50% L ${x}% ${y}%`} stroke="url(#linkGradient)" strokeWidth="1.5" />
                            
                            {/* Vendor Node */}
                            <circle cx={`${x}%`} cy={`${y}%`} r="24" fill="#1e293b" stroke={riskColor} strokeWidth={isHighRisk ? 3 : 1.5} className={isHighRisk ? 'animate-pulse' : ''} />
                            
                            {/* Label */}
                            <text x={`${x}%`} y={`${y}%`} dy="-4" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold" className="pointer-events-none">{v.name.substring(0, 4).toUpperCase()}</text>
                            <text x={`${x}%`} y={`${y}%`} dy="8" textAnchor="middle" fill={riskColor} fontSize="7" fontWeight="bold" className="pointer-events-none">{v.riskScore}</text>

                            {/* Subcontractor Nodes (Simulated Tier 2) */}
                            {v.subcontractors.length > 0 && (
                                <g>
                                    <line x1={`${x}%`} y1={`${y}%`} x2={`${x + (Math.cos(angle)*12)}%`} y2={`${y + (Math.sin(angle)*12)}%`} stroke={theme.graph.link} strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
                                    <circle cx={`${x + (Math.cos(angle)*12)}%`} cy={`${y + (Math.sin(angle)*12)}%`} r="6" fill="#0f172a" stroke="#334155" />
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
        
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-slate-900/80 p-2 rounded border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[10px] text-[var(--colors-textSecondary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--colors-error)] shadow-[0_0_5px_red]"></span> High Risk
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[var(--colors-textSecondary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--colors-warning)]"></span> Moderate
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[var(--colors-textSecondary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--colors-success)]"></span> Stable
            </div>
        </div>
    </div>
  );
};
