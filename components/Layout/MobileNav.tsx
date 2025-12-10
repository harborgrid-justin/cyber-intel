
import React from 'react';
import { Icons } from '../Shared/Icons';
import { View } from '../../types';

interface Props { onNavigate: (v: View) => void; current: View; }

export const MobileNav: React.FC<Props> = ({ onNavigate, current }) => {
  const items = [
    { id: View.DASHBOARD, icon: 'Grid', label: 'Dash' },
    { id: View.INCIDENTS, icon: 'AlertTriangle', label: 'Alerts' },
    { id: View.CASES, icon: 'Layers', label: 'Cases' },
    { id: View.FEED, icon: 'Activity', label: 'Feed' },
    { id: View.MESSAGING, icon: 'Users', label: 'Chat' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex justify-around p-2 pb-safe z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        {items.map(item => {
            const Icon = Icons[item.icon as keyof typeof Icons];
            const active = current === item.id;
            return (
                <button 
                    key={item.id} 
                    onClick={() => onNavigate(item.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                        active 
                        ? 'text-cyan-400 bg-cyan-900/10' 
                        : 'text-slate-500 hover:text-slate-300 active:scale-95'
                    }`}
                >
                    <Icon className={`w-5 h-5 ${active ? 'animate-pulse' : ''}`} />
                    <span className="text-[9px] font-bold uppercase tracking-wide">{item.label}</span>
                </button>
            );
        })}
    </div>
  );
};
