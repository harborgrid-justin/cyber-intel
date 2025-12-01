
import React from 'react';
import { STYLES } from '../../styles/theme';

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick} 
    className={`${onClick ? STYLES.card_interactive : STYLES.card} ${className}`}
  >
    {children}
  </div>
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'text' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary', className = '', ...props }) => {
  const variantClass = {
    primary: STYLES.button.primary,
    secondary: STYLES.button.secondary,
    danger: STYLES.button.danger,
    text: STYLES.button.ghost,
    outline: STYLES.button.outline
  }[variant];
  
  return <button onClick={onClick} className={`${STYLES.button.base} ${variantClass} ${className}`} {...props}>{children}</button>;
};

export const Input = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`${STYLES.input} ${className}`} {...props} />
);

export const TextArea = ({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={`${STYLES.input} ${className}`} {...props} />
);

export const Select = ({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={`${STYLES.input} ${className}`} {...props}>
    {children}
  </select>
);

export const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: string }> = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-2 cursor-pointer" onClick={() => onChange(!checked)}>
    <div className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-cyan-600' : 'bg-slate-700'}`}>
      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-200 ${checked ? 'left-6' : 'left-1'}`} />
    </div>
    {label && <span className="text-sm text-slate-300 font-bold select-none">{label}</span>}
  </div>
);

export const ProgressBar: React.FC<{ value: number; max?: number; color?: string; className?: string }> = ({ value, max = 100, color = 'cyan', className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colorClass = color === 'red' ? 'bg-red-500' : color === 'green' ? 'bg-green-500' : color === 'orange' ? 'bg-orange-500' : 'bg-cyan-500';
  return (
    <div className={`h-2 w-full bg-slate-800 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full transition-all duration-500 ${colorClass}`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

export interface BadgeProps { children: React.ReactNode; color?: string; onClick?: () => void; }

export const Badge: React.FC<BadgeProps> = ({ children, color = 'slate', onClick }) => {
  const colors: Record<string, string> = {
    red: 'bg-red-900/30 text-red-400 border-red-900/50',
    green: 'bg-green-900/30 text-green-400 border-green-900/50',
    blue: 'bg-blue-900/30 text-blue-400 border-blue-900/50',
    cyan: 'bg-cyan-900/30 text-cyan-400 border-cyan-900/50',
    orange: 'bg-orange-900/30 text-orange-400 border-orange-900/50',
    purple: 'bg-purple-900/30 text-purple-400 border-purple-900/50',
    slate: 'bg-slate-800 text-slate-400 border-slate-700',
  };
  return <span onClick={onClick} className={`${STYLES.badge} ${colors[color] || colors.slate} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}>{children}</span>;
};

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
  color?: string;
  icon?: React.ReactNode;
}

export const FilterGroup: React.FC<{
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}> = ({ options, value, onChange, className = '' }) => (
  <div className={`flex gap-2 overflow-x-auto custom-scrollbar items-center ${className}`}>
    {options.map((opt) => {
      const isActive = value === opt.value;
      return (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded border text-[10px] font-bold uppercase whitespace-nowrap transition-all flex items-center gap-2 select-none ${
            isActive
              ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
          }`}
        >
          {opt.color && <span className={`w-1.5 h-1.5 rounded-full ${opt.color}`}></span>}
          {opt.icon}
          {opt.label}
          {opt.count !== undefined && (
            <span className={`px-1.5 py-0.5 rounded text-[9px] ${isActive ? 'bg-cyan-900/50 text-cyan-200' : 'bg-slate-800 text-slate-400'}`}>
              {opt.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean }> = ({ children, className = '', noPadding = false }) => (
  <div className={`${STYLES.container} ${!noPadding ? STYLES.page_padding : ''} ${className}`}>{children}</div>
);

export const HeaderContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-slate-950 border-b border-slate-800 p-4 md:px-6 flex flex-col justify-center shrink-0 ${className}`}>
    {children}
  </div>
);

export const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-1 font-mono">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);

export const Grid: React.FC<{ children: React.ReactNode; cols?: 2 | 3 | 4; className?: string }> = ({ children, cols = 3, className = '' }) => (
  <div className={`${STYLES.grid[cols]} ${className}`}>{children}</div>
);

export const EmptyState: React.FC<{ icon?: React.ReactNode; message: string; action?: React.ReactNode }> = ({ icon, message, action }) => (
  <div className="flex flex-col items-center justify-center p-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/30 text-center">
    <div className="text-slate-600 mb-4">{icon || "Nothing here."}</div>
    <div className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-4">{message}</div>
    {action}
  </div>
);
