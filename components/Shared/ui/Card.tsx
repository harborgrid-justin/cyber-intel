import React from 'react';
import { STYLES, EXECUTIVE_THEME } from '../../../styles/theme';
import { Icons } from '../Icons';

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, noPadding, style }) => (
  <div 
    onClick={onClick} 
    style={style}
    className={`${onClick ? STYLES.card_interactive : STYLES.card} ${noPadding ? '' : 'p-[var(--spacing-card)]'} flex flex-col min-w-0 ${className}`}
  >
    {children}
  </div>
);

export const MetricValue: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`${EXECUTIVE_THEME.typography.value_huge} ${className}`}>{children}</div>
);

export const AlertBanner: React.FC<{ title: string, message: string, type: 'info' | 'warning', className?: string }> = ({ title, message, type, className }) => {
    const Icon = type === 'info' ? Icons.Activity : Icons.AlertTriangle;
    
    const baseClass = type === 'info' 
        ? `bg-[var(--colors-infoDim)] border-l-4 border-l-[var(--colors-info)] text-[var(--colors-textSecondary)]`
        : `bg-[var(--colors-warningDim)] border-l-4 border-l-[var(--colors-warning)] text-[var(--colors-textSecondary)]`;
    
    const iconColor = type === 'info' ? 'text-[var(--colors-info)]' : 'text-[var(--colors-warning)]';

    return (
        <div className={`p-4 rounded-r border-y border-r border-[var(--colors-borderDefault)] ${baseClass} ${className}`}>
            <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${iconColor}`} /> 
                <h3 className={`font-semibold text-sm text-[var(--colors-textPrimary)]`}>{title}</h3>
            </div>
            <p className="text-xs leading-relaxed ml-6">{message}</p>
        </div>
    );
};
