
import React from 'react';

// Re-export all the modular UI components from a single point for cleaner imports.
export * from './ui/Card';
export * from './ui/Button';
export * from './ui/Badge';
export * from './ui/Input';
export * from './ui/ProgressBar';
export * from './ui/Headers';
export * from './ui/Select';
export * from './ui/TextArea';
export * from './ui/FilterGroup';
export * from './ui/DataList';
export * from './ui/EmptyState';
export * from './ui/DataField';
export * from './ui/Switch';
export * from './ui/TagList';

// Keep any remaining small components that weren't extracted
export const Grid: React.FC<{ children: React.ReactNode; cols?: 1 | 2 | 3 | 4 | 5 | 6; className?: string }> = ({ children, cols = 3, className = '' }) => {
  const gridCols = { 1: 'grid-cols-1', 2: 'grid-cols-1 md:grid-cols-2', 3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4', 5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5', 6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' };
  return <div className={`grid ${gridCols[cols]} gap-4 md:gap-6 ${className}`}>{children}</div>;
};

export const Timestamp: React.FC<{ date: string | Date; format?: 'full' | 'time' | 'date'; className?: string }> = ({ date, format = 'full', className = '' }) => {
    const d = new Date(date);
    const str = format === 'time' ? d.toLocaleTimeString() : format === 'date' ? d.toLocaleDateString() : d.toLocaleString();
    return <span className={`font-mono text-[10px] text-slate-500 whitespace-nowrap ${className}`}>{str}</span>;
};
    