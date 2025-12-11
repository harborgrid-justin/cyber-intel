
import React from 'react';
import { STYLES } from '../../../styles/theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'text' | 'outline';
  size?: 'xs' | 'sm' | 'md';
}

export const Button: React.FC<ButtonProps> = React.memo(({ onClick, children, variant = 'primary', size = 'sm', className = '', ...props }) => {
  const variantClass = {
    primary: STYLES.button.primary,
    secondary: STYLES.button.secondary,
    danger: STYLES.button.danger,
    text: STYLES.button.ghost,
    outline: STYLES.button.outline
  }[variant];
  
  const sizeClass = {
      xs: 'text-[var(--fontSizes-xs)] px-2 py-1',
      sm: 'text-[var(--fontSizes-sm)] px-3 py-1.5',
      md: 'text-[var(--fontSizes-base)] px-4 py-2'
  }[size];
  
  return <button onClick={onClick} className={`${STYLES.button.base} ${variantClass} ${sizeClass} ${className}`} {...props}>{children}</button>;
});
