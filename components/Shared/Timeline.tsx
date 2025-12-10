
import React from 'react';
import { Icons } from './Icons';

export interface TimelineItem {
  id?: string;
  date: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  type?: string;
  onClick?: () => void;
  highlight?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const Timeline: React.FC<TimelineProps> = React.memo(({ items, className = '' }) => {
  if (items.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-[var(--colors-textTertiary)] border-2 border-dashed border-[var(--colors-borderDefault)] rounded-lg bg-[var(--colors-surfaceSubtle)]">
            <Icons.Clock className="w-8 h-8 mb-2 opacity-50" />
            <div className="text-xs font-bold uppercase tracking-widest">No Events Recorded</div>
        </div>
    );
  }

  const getTypeStyle = (type?: string) => {
    const t = (type || '').toUpperCase();
    if (['ALERT', 'CRITICAL', 'END'].includes(t)) return { backgroundColor: 'var(--colors-error)', boxShadow: 'var(--shadows-glowError)' };
    if (['ACTION', 'START', 'CASE'].includes(t)) return { backgroundColor: 'var(--colors-primary)', boxShadow: 'var(--shadows-glowPrimary)' };
    if (['REPORT', 'TRANSFER'].includes(t)) return { backgroundColor: 'var(--colors-accent)', boxShadow: 'var(--shadows-glowAccent)' };
    return { backgroundColor: 'var(--colors-textTertiary)' };
  };

  return (
    <div className={`relative px-2 ${className}`}>
      {/* Continuous Vertical Line */}
      <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-[var(--colors-borderDefault)]"></div>
      
      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={item.id || i} className="relative flex gap-4 group">
            {/* Node */}
            <div 
                className={`relative z-10 w-4 h-4 rounded-full border-2 border-[var(--colors-surfaceDefault)] mt-1.5 shrink-0 transition-all duration-300 group-hover:scale-125`}
                style={getTypeStyle(item.type)}
            ></div>
            
            {/* Content Card */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[10px] font-mono text-[var(--colors-textTertiary)]">{item.date}</span>
                    {item.type && <span className="text-[9px] font-bold uppercase text-[var(--colors-textSecondary)] bg-[var(--colors-surfaceHighlight)] px-1.5 py-0.5 rounded border border-[var(--colors-borderDefault)]">{item.type}</span>}
                </div>
                
                <div 
                  className={`
                    p-3 rounded-lg border border-[var(--colors-borderDefault)] bg-[var(--colors-surfaceSubtle)] backdrop-blur-sm transition-all duration-200
                    ${item.onClick ? 'cursor-pointer hover:border-[var(--colors-primary)]/50 hover:bg-[var(--colors-surfaceHighlight)] hover:shadow-lg' : ''}
                  `}
                  onClick={item.onClick}
                >
                  <div className={`text-sm font-bold text-[var(--colors-textPrimary)] ${item.onClick ? 'group-hover:text-[var(--colors-primary)]' : ''}`}>
                    {item.title}
                  </div>
                  {item.description && (
                    <div className="text-xs text-[var(--colors-textSecondary)] mt-1 leading-relaxed font-mono">
                        {item.description}
                    </div>
                  )}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
export { Timeline };