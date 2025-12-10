import React from 'react';
import { EXECUTIVE_THEME, STYLES } from '../../../styles/theme';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => (
  <input 
    ref={ref}
    className={`${EXECUTIVE_THEME.surfaces.input_field} w-full px-3 py-2 text-[var(--fontSizes-sm)] placeholder-slate-600 transition-shadow duration-200 ${className}`} 
    {...props} 
  />
));

Input.displayName = 'Input';

export const Label: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <label className={`${EXECUTIVE_THEME.typography.mono_label} mb-1.5 block ${className || ''}`}>{children}</label>
);
