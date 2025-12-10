
import React from 'react';
import { Card, CardHeader } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';

interface SettingsLayoutProps {
  activeModule: string;
  onModuleChange: (m: string) => void;
  children: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ activeModule, onModuleChange, children }) => {
  const config = useDataStore(() => threatData.getAppConfig());
  const menuItems = [
    { id: 'Profile', icon: 'Users', label: 'My Profile', desc: 'Identity & Security' },
    { id: 'Notifications', icon: 'Activity', label: 'Notifications', desc: 'Alert Preferences' },
    { id: 'API Keys', icon: 'Key', label: 'API Access', desc: 'Developer Keys' },
    { id: 'Integrations', icon: 'Layers', label: 'Integrations', desc: '3rd Party Tools' },
    { id: 'System', icon: 'Monitor', label: 'System', desc: 'Global Config', adminOnly: true },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 p-4 md:p-6 min-h-0">
        {/* Sidebar Navigation */}
        <Card className="w-full lg:w-72 p-0 overflow-hidden shrink-0 h-fit bg-slate-950 border-slate-800">
            <CardHeader title="Configuration" />
            <div className="p-2 space-y-1">
                {menuItems.map((item) => {
                    // Safe access to Icon with fallback
                    const IconComponent = Icons[item.icon as keyof typeof Icons] || Icons.Activity;
                    const isActive = activeModule === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onModuleChange(item.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group text-left ${
                                isActive 
                                ? 'bg-cyan-900/20 border border-cyan-900/50' 
                                : 'hover:bg-slate-900 border border-transparent'
                            }`}
                        >
                            <div className={`p-2 rounded shrink-0 ${isActive ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                                <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <div className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>{item.label}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">{item.desc}</div>
                            </div>
                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] shrink-0"></div>}
                        </button>
                    );
                })}
            </div>
            <div className="p-4 mt-2 border-t border-slate-900">
                <div className="text-[10px] text-slate-600 text-center">
                    {config.appName} v{config.version}<br/>
                    {config.orgName}
                </div>
            </div>
        </Card>

        {/* Content Area */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar rounded-lg">
            {children}
        </div>
    </div>
  );
};
