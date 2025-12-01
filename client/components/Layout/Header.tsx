
import React, { useState, useEffect } from 'react';
import { CONFIG } from '../../config';
import { threatData } from '../services-frontend/dataLayer';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [dbInfo, setDbInfo] = useState(threatData.getAdapterInfo());

  useEffect(() => {
    const handleDbChange = () => setDbInfo(threatData.getAdapterInfo());
    window.addEventListener('db-adapter-changed', handleDbChange);
    return () => window.removeEventListener('db-adapter-changed', handleDbChange);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-6 sticky top-0 z-20 shadow-md">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white mr-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="hidden sm:flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
           <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           <input type="text" placeholder="QUERY INTELLIGENCE DB..." className="bg-transparent text-xs text-slate-200 w-64 focus:outline-none placeholder-slate-600 font-mono" />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="hidden lg:flex items-center gap-4">
           <div className="flex flex-col items-end">
             <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Persistence</span>
             <span className={`text-xs font-bold font-mono uppercase ${dbInfo.type === 'SQL' ? 'text-blue-400' : 'text-slate-400'}`}>
               {dbInfo.name}
             </span>
           </div>
           <div className="h-8 w-px bg-slate-700"></div>
           <div className="flex flex-col items-end">
             <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Threat Level</span>
             <span className="text-xs font-bold text-amber-500 animate-pulse font-mono">{CONFIG.APP.THREAT_LEVEL}</span>
           </div>
           <div className="h-8 w-px bg-slate-700"></div>
           <div className="flex flex-col items-end">
             <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">System Time</span>
             <span className="text-xs font-mono text-cyan-500">{new Date().toISOString().split('T')[1].split('.')[0]}Z</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white font-mono">{CONFIG.USER.NAME}</div>
            <div className="text-[10px] text-cyan-600 font-bold tracking-widest uppercase">Clearance: {CONFIG.USER.CLEARANCE}</div>
          </div>
          <div className="h-9 w-9 bg-slate-800 rounded border border-slate-600 flex items-center justify-center text-slate-300 font-bold shadow-inner">
            {CONFIG.USER.INITIALS}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
