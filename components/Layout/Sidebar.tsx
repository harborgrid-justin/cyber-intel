
import React from 'react';
import { View } from '../../types';
import { Icons } from '../Shared/Icons';
import { threatData } from '../../services/dataLayer';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { view: 'DASHBOARD', label: 'Dashboard', icon: 'Grid' },
    { view: 'FEED', label: 'Threat Feed', icon: 'Activity' },
    { view: 'ANALYSIS', label: 'Intel Analysis', icon: 'Cpu' },
    { view: 'CASES', label: 'Case Management', icon: 'Briefcase' },
    { view: 'ACTORS', label: 'Threat Actors', icon: 'Users' },
    { view: 'SETTINGS', label: 'System Config', icon: 'Settings' },
  ];

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full shadow-2xl relative z-20">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.5)]">
                <Icons.Shield className="w-5 h-5 text-white" />
            </div>
            <div>
                <h1 className="text-white font-bold text-sm tracking-wider uppercase">{threatData.config.appName}</h1>
                <div className="text-[10px] text-cyan-500 font-mono tracking-widest">ENTERPRISE</div>
            </div>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = currentView === item.view;
          const Icon = (Icons as any)[item.icon] || Icons.Activity;
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view as View)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 group ${
                active 
                  ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-800/50 shadow-[inset_0_0_10px_rgba(8,145,178,0.1)]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-white'}`} />
              {item.label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></div>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
            <div className="text-xs text-slate-500 font-mono mb-1">SYSTEM STATUS</div>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-emerald-500 text-xs font-bold">OPERATIONAL</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
