
import React from 'react';
import { Icons } from '../Icons';

interface AlertBannerProps {
  title: string;
  message?: string;
  children?: React.ReactNode;
  type: 'info' | 'warning' | 'error' | 'success';
  className?: string;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ title, message, children, type, className, onDismiss }) => {
  const Icon = {
    info: Icons.Activity,
    warning: Icons.AlertTriangle,
    error: Icons.AlertTriangle,
    success: Icons.CheckCircle
  }[type];

  const baseClass = {
    info: 'bg-[var(--colors-infoDim)] border-l-[var(--colors-info)] text-[var(--colors-textSecondary)]',
    warning: 'bg-[var(--colors-warningDim)] border-l-[var(--colors-warning)] text-[var(--colors-textSecondary)]',
    error: 'bg-[var(--colors-errorDim)] border-l-[var(--colors-error)] text-[var(--colors-textSecondary)]',
    success: 'bg-[var(--colors-successDim)] border-l-[var(--colors-success)] text-[var(--colors-textSecondary)]',
  }[type];
    
  const iconColor = `text-[var(--colors-${type})]`;

  return (
    <div className={`p-4 rounded-r border-y border-r border-[var(--colors-borderDefault)] border-l-4 ${baseClass} ${className || ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${iconColor}`} /> 
          <h3 className={`font-semibold text-sm text-[var(--colors-textPrimary)]`}>{title}</h3>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-slate-500 hover:text-white">
            <Icons.UserX className="w-4 h-4" />
          </button>
        )}
      </div>
      {(message || children) && (
        <div className="text-xs leading-relaxed ml-8 mt-1">
          {message && <p>{message}</p>}
          {children}
        </div>
      )}
    </div>
  );
};
