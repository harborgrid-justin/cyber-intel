
import React from 'react';
import { STYLES, TOKENS } from '../../../styles/theme';

export type StatusColor = 'red' | 'green' | 'blue' | 'cyan' | 'orange' | 'purple' | 'slate' | 'yellow' | 'error' | 'success' | 'warning' | 'info' | 'critical' | 'high' | 'medium' | 'low';

export const StatusIndicator: React.FC<{ color?: StatusColor; pulse?: boolean; className?: string; style?: React.CSSProperties }> = React.memo(({ color = 'slate', pulse = false, className = '', style }) => {
  const colorVar = `var(--colors-${color}, var(--colors-textTertiary))`;
  const glowVar = `var(--shadows-glow${color.charAt(0).toUpperCase() + color.slice(1)}, none)`;

  return (
    <span 
      className={`w-2 h-2 rounded-full inline-block ${pulse ? 'animate-pulse' : ''} ${className}`} 
      style={{ backgroundColor: colorVar, boxShadow: glowVar, ...style }} 
    />
  );
});

export const Badge: React.FC<{ children: React.ReactNode; color?: StatusColor; onClick?: () => void; className?: string; }> = ({ children, color = 'slate', onClick, className = '' }) => {
    
    return (
        <span 
            onClick={onClick} 
            className={`
                ${STYLES.badge} 
                bg-[var(--colors-${color}Dim,var(--colors-surfaceHighlight))]
                text-[var(--colors-${color},var(--colors-textSecondary))]
                border-[var(--colors-${color},var(--colors-borderDefault))]
                border
                ${onClick ? 'cursor-pointer hover:brightness-125 transition-all' : ''} 
                ${className} whitespace-nowrap shadow-sm backdrop-blur-sm
            `}
        >
            {children}
        </span>
    );
};

export const StatusBadge: React.FC<{ status: string; color?: StatusColor; className?: string }> = ({ status, color, className = '' }) => {
    let finalColor: StatusColor = color || 'slate';
    if (!color) {
        const lower = status.toLowerCase();
        if (['active', 'online', 'secure', 'open', 'new', 'valid', 'resolved', 'patched', 'completed', 'implemented'].includes(lower)) finalColor = 'success';
        else if (['critical', 'offline', 'breached', 'expired', 'failed', 'blocked', 'isolated', 'compromised'].includes(lower)) finalColor = 'error';
        else if (['warning', 'degraded', 'investigating', 'pending', 'draft', 'unknown', 'planned'].includes(lower)) finalColor = 'warning';
        else if (['info', 'processing', 'in_progress'].includes(lower)) finalColor = 'info';
    }
    
    return (
        <Badge color={finalColor} className={`flex items-center gap-1.5 pl-2 pr-3 ${className}`}>
            <StatusIndicator color={finalColor} className="w-1.5 h-1.5" />
            <span className="uppercase tracking-wide text-[9px] font-bold">{status}</span>
        </Badge>
    );
};