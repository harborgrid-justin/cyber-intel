
import React from 'react';
import { STYLES, EXECUTIVE_THEME } from '../../../styles/theme';

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

export const SectionHeader: React.FC<{ title: React.ReactNode; action?: React.ReactNode; className?: string; subtitle?: string }> = ({ title, action, className = '', subtitle }) => (
  <div className={`px-[var(--spacing-md)] py-[var(--spacing-xxs)] border-b border-slate-800 bg-slate-950/30 flex justify-between items-center shrink-0 gap-4 min-h-[48px] ${className}`}>
    <div className="flex-1 min-w-0">
        <div className={`${EXECUTIVE_THEME.typography.h3} truncate`}>{title}</div>
        {subtitle && <div className="text-[var(--fontSizes-xs)] text-slate-500 font-normal mt-0.5 truncate">{subtitle}</div>}
    </div>
    {action && <div className="flex gap-2 items-center shrink-0">{action}</div>}
  </div>
);

export const CardHeader = SectionHeader;
