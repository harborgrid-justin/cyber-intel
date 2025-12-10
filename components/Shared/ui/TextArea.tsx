import React from 'react';
import { EXECUTIVE_THEME, STYLES } from '../../../styles/theme';

export const TextArea = ({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea 
    className={`${EXECUTIVE_THEME.surfaces.input_field} w-full px-3 py-2 text-sm placeholder-slate-600 transition-shadow duration-200 ${className}`} 
    {...props} 
  />
);
