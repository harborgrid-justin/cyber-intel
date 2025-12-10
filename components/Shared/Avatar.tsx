
import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'Online' | 'Offline' | 'Busy' | 'LOCKED' | 'FATIGUED';
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', className = '', status }) => {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  
  const sizeClass = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-20 h-20 text-xl'
  }[size];

  const statusColor = {
    'Online': 'bg-green-500',
    'Offline': 'bg-slate-500',
    'Busy': 'bg-red-500',
    'LOCKED': 'bg-red-600',
    'FATIGUED': 'bg-orange-500'
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClass} rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-300 shadow-inner`}>
        {initials}
      </div>
      {status && (
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${statusColor[status] || 'bg-slate-500'}`}></div>
      )}
    </div>
  );
};
