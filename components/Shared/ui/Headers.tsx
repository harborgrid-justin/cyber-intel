
import React from 'react';
import { EXECUTIVE_THEME, STYLES } from '../../../styles/theme';
import { SectionHeader } from './Card'; // Re-export for convenience

export { SectionHeader, CardHeader } from './Card';

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

export const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
    <div className="flex-1 min-w-0">
      <h2 className={`${EXECUTIVE_THEME.typography.h1} truncate`}>{title}</h2>
      {subtitle && <p className={`mt-1 ${EXECUTIVE_THEME.typography.mono_code} text-slate-500 truncate`}>{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3 flex-wrap shrink-0">{actions}</div>}
  </div>
);
