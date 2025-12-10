
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'slate' | 'white';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'cyan', className = '' }) => {
  const sizeClass = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  }[size];

  const colorClass = {
    cyan: 'border-cyan-500',
    slate: 'border-slate-500',
    white: 'border-white'
  }[color];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClass} ${colorClass} border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
};
