
import React, { forwardRef } from 'react';
import { STYLES } from '../../styles/theme';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const ForwardedInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && <label className="text-[10px] uppercase font-bold text-slate-500">{label}</label>}
        <input 
          ref={ref} 
          className={`${STYLES.input} ${error ? 'border-red-500 focus:border-red-500' : ''} ${className}`}
          {...props} 
        />
        {error && <span className="text-[9px] text-red-400">{error}</span>}
      </div>
    );
  }
);

ForwardedInput.displayName = 'ForwardedInput';
