

import React, { useState, useEffect } from 'react';
import { threatData } from '../../services/dataLayer';
import { useDataStore, useNetworkStatus, useThemeEngine } from '../../hooks';
import { NotificationBell } from '../Shared/NotificationSystem';
import { Icons } from '../Shared/Icons';
import { STYLES } from '../../styles/theme';

interface HeaderProps { toggleSidebar: () => void; }

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const config = useDataStore(() => threatData.getAppConfig());
  const { online } = useNetworkStatus();
  const { theme } = useThemeEngine(); 

  const toggleTheme = () => {
    window.dispatchEvent(new Event('toggle-theme'));
  };

  return (
    <header className={`bg-[var(--colors-surfaceDefault)] border-b border-[var(--colors-borderDefault)] h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 shadow-sm z-[var(--zIndex-header)]`}>
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className={`md:hidden text-[var(--colors-textSecondary)] hover:text-[var(--colors-textPrimary)] p-1 rounded-md hover:bg-[var(--colors-surfaceHighlight)] transition-colors`}>
          <Icons.Grid className="w-5 h-5" />
        </button>
        
        {/* Global Search / Command */}
        <div className="hidden sm:flex items-center group cursor-pointer" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
            <div className="relative">
                <Icons.Search className={`w-3.5 h-3.5 text-[var(--colors-textTertiary)] absolute left-3 top-2.5 group-hover:text-[var(--colors-primary)] transition-colors`} />
                <div className={`${STYLES.input} py-1.5 pl-9 pr-12 text-xs text-[var(--colors-textSecondary)] group-hover:border-[var(--colors-borderFocus)] group-hover:text-[var(--colors-textPrimary)] w-64 shadow-inner cursor-pointer`}>
                    Search intelligence...
                </div>
                <div className="absolute right-2 top-1.5 flex gap-1">
                    <span className={`text-[10px] text-[var(--colors-textTertiary)] bg-[var(--colors-surfaceRaised)] border border-[var(--colors-borderSubtle)] px-1.5 rounded font-mono group-hover:text-[var(--colors-textSecondary)]`}>⌘K</span>
                </div>
            </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4 text-xs">
           <div className={`flex items-center gap-2 bg-[var(--colors-surfaceHighlight)] px-3 py-1 rounded-full border border-[var(--colors-borderDefault)]`}>
                <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-[var(--colors-success)] shadow-[var(--shadows-glowSuccess)]' : 'bg-[var(--colors-error)]'}`}></span>
                <span className="text-[var(--colors-textSecondary)]">{online ? 'System Online' : 'Offline'}</span>
           </div>
           
           <div className={`h-4 w-px bg-[var(--colors-borderSubtle)]`}></div>
           
           <div className="flex items-center gap-2">
             <span className="text-[var(--colors-textSecondary)]">Threat Level:</span>
             <span className="font-bold text-[var(--colors-warning)] tracking-wide">{config.threatLevel.split('(')[0]}</span>
           </div>
        </div>
        
        <div className={`flex items-center gap-2 pl-4 border-l border-[var(--colors-borderDefault)]`}>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-lg text-[var(--colors-textSecondary)] hover:text-[var(--colors-textPrimary)] hover:bg-[var(--colors-surfaceHighlight)] transition-colors`}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Icons.Sun className="w-4 h-4" /> : <Icons.Moon className="w-4 h-4" />}
          </button>
          
          <div className="relative">
            <NotificationBell />
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
