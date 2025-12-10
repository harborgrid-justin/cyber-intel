
import React from 'react';

export const FilterGroup: React.FC<{
    options: { label: string; value: string; count?: number; color?: 'success' | 'error' | 'warning' | 'info' | 'primary' | string; icon?: React.ReactNode }[];
    value: string;
    onChange: (val: string) => void;
    className?: string;
  }> = ({ options, value, onChange, className = '' }) => (
    <div className={`flex gap-1 p-1 bg-[var(--colors-surfaceHighlight)] border border-[var(--colors-borderDefault)] rounded-lg overflow-x-auto custom-scrollbar ${className}`}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase whitespace-nowrap transition-all flex items-center gap-2 select-none border ${
              isActive
                ? 'bg-[var(--colors-surfaceRaised)] border-[var(--colors-borderFocus)] text-[var(--colors-textPrimary)] shadow-sm'
                : 'bg-transparent border-transparent text-[var(--colors-textSecondary)] hover:text-[var(--colors-textPrimary)] hover:bg-[var(--colors-surfaceRaised)]'
            }`}
          >
            {opt.color && <span className={`w-1.5 h-1.5 rounded-full shadow-sm`} style={{ backgroundColor: `var(--colors-${opt.color})` }}></span>}
            {opt.icon}
            {opt.label}
            {opt.count !== undefined && ( <span className={`px-1.5 py-0.5 rounded text-[9px] ${isActive ? 'bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-500'}`}>{opt.count}</span>)}
          </button>
        );
      })}
    </div>
  );