
import React, { useState, useEffect, useMemo } from 'react';
import { View } from '../../types';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks';
import { Icons } from '../Shared/Icons';
import { STYLES } from '../../styles/theme';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen }) => {
  const currentUser = useDataStore(() => threatData.currentUser);
  const permissions = useMemo(() => currentUser?.effectivePermissions || [], [currentUser]);
  const config = useDataStore(() => threatData.getAppConfig());
  const navigationConfig = useDataStore(() => threatData.getNavigationConfig());

  const hasPerm = (p: string) => permissions.includes(p) || permissions.includes('*:*');

  const NavIcon = ({ name, className = "w-4 h-4" }: { name: string, className?: string }) => {
     const IconComponent = Icons[name as keyof typeof Icons] || Icons.Activity;
     return <IconComponent className={className} />;
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-[var(--zIndex-sticky)] w-64 border-r border-[var(--colors-borderDefault)]
      bg-[var(--colors-surfaceDefault)] backdrop-blur-xl transition-transform duration-300 
      md:relative md:translate-x-0 flex flex-col shadow-2xl
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}>
      {/* Branding Area */}
      <div className={`h-14 flex items-center px-4 border-b border-[var(--colors-borderDefault)] shrink-0`}>
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-[var(--shadows-glowBrand)] bg-[var(--colors-brand)]`}>
                <Icons.Shield className="w-5 h-5" />
            </div>
            <div>
                <h1 className={`text-sm font-bold text-[var(--colors-textPrimary)] tracking-tight`}>{config.appName}</h1>
                <div className={`text-[9px] text-[var(--colors-textSecondary)] font-medium tracking-wide`}>ENTERPRISE CORE</div>
            </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8 custom-scrollbar">
        {navigationConfig.map((group) => {
          const visibleItems = group.items.filter(i => hasPerm(i.perm));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.group}>
              <div className="px-3 mb-2">
                <span className="text-[11px] text-[var(--colors-textTertiary)] font-medium tracking-wide uppercase">{group.group}</span>
              </div>
              <div className="space-y-0.5">
                  {visibleItems.map((item) => (
                  <button 
                    key={item.view} 
                    onClick={() => onNavigate(item.view)} 
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group relative ${
                        currentView === item.view 
                        ? 'bg-[var(--colors-primaryDim)] text-[var(--colors-primary)]' 
                        : `text-[var(--colors-textSecondary)] hover:bg-[var(--colors-surfaceHighlight)] hover:text-[var(--colors-textPrimary)]`
                    }`}
                  >
                    {currentView === item.view && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[var(--colors-primary)] rounded-r" style={{boxShadow: 'var(--shadows-glowPrimary)'}}></div>}
                    <span className={`mr-3 transition-colors ${currentView === item.view ? 'text-[var(--colors-primary)]' : 'group-hover:text-[var(--colors-textPrimary)]'}`}>
                        <NavIcon name={item.icon} />
                    </span>
                    {item.label}
                  </button>
              ))}
              </div>
            </div>
          );
      })}
      </nav>

      {/* User Profile Footer */}
      <div className={`p-4 border-t border-[var(--colors-borderDefault)] shrink-0 bg-[var(--colors-surfaceDefault)]`}>
        <button onClick={() => onNavigate(View.SETTINGS)} className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--colors-surfaceHighlight)] transition-colors group`}>
            <div className={`w-8 h-8 rounded-full bg-[var(--colors-surfaceRaised)] border border-[var(--colors-borderSubtle)] flex items-center justify-center relative`}>
                <span className={`text-xs font-semibold text-[var(--colors-textPrimary)]`}>
                    {currentUser?.name?.charAt(0) || 'A'}
                </span>
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 bg-[var(--colors-success)] border-2 border-[var(--colors-borderDefault)] rounded-full shadow-sm`}></span>
            </div>
            <div className="flex-1 text-left min-w-0">
                <div className={`text-xs font-semibold text-[var(--colors-textPrimary)] truncate`}>{currentUser?.name || 'Administrator'}</div>
                <div className={`text-[10px] text-[var(--colors-textSecondary)] truncate`}>{config.orgName}</div>
            </div>
            <Icons.Settings className={`w-4 h-4 text-[var(--colors-textTertiary)] group-hover:text-[var(--colors-textSecondary)] transition-colors`} />
        </button>
      </div>
    </div>
  );
};
export default Sidebar;
