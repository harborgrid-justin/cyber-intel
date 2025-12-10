import React from 'react';
import { EXECUTIVE_THEME, STYLES } from '../../../styles/theme';

// Fix: Add missing component definitions
export const PageContainer: React.FC<{ children: React.ReactNode, noPadding?: boolean, className?: string }> = ({ children, noPadding, className }) => (
    <div className={`${STYLES.page_container} ${!noPadding ? STYLES.page_padding : ''} ${className || ''}`}>
        {children}
    </div>
);

export const HeaderContainer: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] lg:px-[var(--spacing-xl)] py-[var(--spacing-md)] border-b border-slate-800 bg-slate-950/50 shrink-0 ${className || ''}`}>
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

export const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
    <div className="flex-1 min-w-0">
      <h2 className={`${EXECUTIVE_THEME.typography.h1} truncate`}>{title}</h2>
      {subtitle && <p className={`mt-1 ${EXECUTIVE_THEME.typography.mono_code} text-slate-500 truncate`}>{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3 flex-wrap shrink-0">{actions}</div>}
  </div>
);

export const CardHeader = SectionHeader;
