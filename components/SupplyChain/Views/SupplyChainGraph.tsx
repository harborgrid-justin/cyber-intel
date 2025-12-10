
import React from 'react';
import { Vendor } from '../../../types';
import { Card, CardHeader } from '../../Shared/UI';
import { TOKENS } from '../../../styles/theme';

interface Props {
  vendors: Vendor[];
}

export const SupplyChainGraph: React.FC<Props> = ({ vendors }) => {
  const theme = TOKENS.dark; // Use dark theme tokens directly

  return (
    <div className="h-full bg-[var(--colors-surfaceSubtle)] border border-[var(--colors-borderDefault)] rounded-xl relative overflow-hidden flex flex-col">
        <CardHeader title="N-Tier Dependency Map" />
        <div className="absolute top-14 left-4 z-10 bg-[var(--colors-surfaceDefault)] p-2 rounded border border-[var(--colors-borderSubtle)]">
            <div className="text-[10px] font-bold text-[var(--colors-textSecondary)] uppercase">Supply Chain Depth</div>
            <div className="text-lg font-bold text-[var(--colors-textPrimary)]">Tier 1 → Tier 4</div>
        </div>
        
        <div className="flex-1 relative">
            <svg className="w-full h-full absolute inset-0">
                <defs>
                    <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={theme.graph.link} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={theme.graph.link} stopOpacity="0.8" />
                    </linearGradient>
                </defs>
                {/* Central Node */}
                <circle cx="50%" cy="50%" r="35" fill={theme.colors.appBg} stroke={theme.colors.primary} strokeWidth="2" style={{filter: `drop-shadow(${theme.shadows.glowPrimary})`}} />
                <text x="50%" y="50%" dy="5" textAnchor="middle" fill={theme.colors.primary} fontSize="10" fontWeight="bold">SENTINEL</text>

                {/* Vendor Nodes */}
                {vendors.map((v, i) => {
                    const count = vendors.length;
                    const angle = (i / count) * 2 * Math.PI;
                    const radius = 35; // %
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);
                    
                    const isHighRisk = v.riskScore > 75;
                    // Use nested state colors for new system, ensure type safety by casting or using known keys
                    const riskColor = isHighRisk ? theme.colors.state.error : theme.colors.state.success;

                    return (
                        <g key={v.id} className="cursor-pointer hover:opacity-80 transition-opacity">
                            {/* Connection Line */}
                            <line x1="50%" y1="50%" x2={`${x}%`} y2={`${y}%`} stroke="url(#linkGradient)" strokeWidth="1" />
                            
                            {/* Outer Node */}
                            <circle cx={`${x}%`} cy={`${y}%`} r="18" fill={theme.colors.surface.raised} stroke={riskColor} strokeWidth={isHighRisk ? 2 : 1} className={isHighRisk ? 'animate-pulse' : ''} />
                            
                            {/* Label */}
                            <text x={`${x}%`} y={`${y}%`} dy="4" textAnchor="middle" fill={theme.colors.text.primary} fontSize="8" fontWeight="bold">
                                {v.name.substring(0, 3).toUpperCase()}
                            </text>
                            
                            {/* Subcontractor Nodes (Simulated) */}
                            {v.subcontractors.length > 0 && (
                                <line x1={`${x}%`} y1={`${y}%`} x2={`${x + (Math.cos(angle)*10)}%`} y2={`${y + (Math.sin(angle)*10)}%`} stroke={theme.graph.link} strokeWidth="0.5" strokeDasharray="2,2" />
                            )}
                            {v.subcontractors.length > 0 && (
                                <circle cx={`${x + (Math.cos(angle)*10)}%`} cy={`${y + (Math.sin(angle)*10)}%`} r="5" fill={theme.colors.surface.subtle} stroke={theme.colors.border.default} />
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
        
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] text-[var(--colors-textSecondary)]">
                <span className="w-3 h-3 rounded-full border border-[var(--colors-error)] bg-[var(--colors-surfaceDefault)]"></span> High Risk
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[var(--colors-textSecondary)]">
                <span className="w-3 h-3 rounded-full border border-[var(--colors-success)] bg-[var(--colors-surfaceDefault)]"></span> Stable
            </div>
        </div>
    </div>
  );
};
