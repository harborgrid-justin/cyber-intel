import React from 'react';
import { StatusColor } from './Badge';
import { TOKENS } from '../../../styles/theme';

export const ProgressBar: React.FC<{ value: number; max?: number; color?: StatusColor; className?: string; showValue?: boolean }> = ({ value, max = 100, color = 'cyan', className = '', showValue = false }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorName = color.charAt(0).toUpperCase() + color.slice(1);
  const glowVar = `var(--shadows-glow${colorName}, none)`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
        <div className={`h-1.5 w-full bg-[var(--colors-surfaceRaised)] rounded-full overflow-hidden flex-1`}>
            <div 
                className={`h-full transition-all duration-700 ease-out rounded-full bg-[var(--colors-${color})]`} 
                style={{ width: `${percentage}%`, boxShadow: glowVar }} 
            />
        </div>
        {showValue && <span className={`text-[9px] font-mono text-[var(--colors-textSecondary)] w-8 text-right`}>{Math.round(percentage)}%</span>}
    </div>
  );
};