
import React from 'react';
import { View } from '../../types';
import { CONFIG } from '../../config';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen }) => {
  const Icon = ({ path }: { path: string }) => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} /></svg>
  );

  const navigation = [
    {
      group: "Mission Control",
      items: [
        { label: 'Command Center', view: View.DASHBOARD, path: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
        { label: 'Sentinel Chat', view: View.MESSAGING, path: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
        { label: 'Incident Response', view: View.INCIDENTS, path: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
        { label: 'Case Management', view: View.CASES, path: "M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" },
        { label: 'Active Defense', view: View.ORCHESTRATOR, path: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
      ]
    },
    {
      group: "Threat Intelligence",
      items: [
        { label: 'Live Intel Feed', view: View.FEED, path: "M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
        { label: 'Adversary Profiles', view: View.ACTORS, path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
        { label: 'Campaign Tracking', view: View.CAMPAIGNS, path: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        { label: 'Vulnerability Mgmt', view: View.VULNERABILITIES, path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.333 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
        { label: 'MITRE Knowledge Base', view: View.MITRE, path: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
      ]
    },
    {
      group: "Advanced Operations",
      items: [
        { label: 'Detection Engineering', view: View.DETECTION, path: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
        { label: 'Supply Chain Risk', view: View.SUPPLY_CHAIN, path: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
        { label: 'Breach Simulation', view: View.SIMULATION, path: "M13 10V3L4 14h7v7l9-11h-7z" },
        { label: 'Executive Protection', view: View.VIP_PROTECTION, path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
        { label: 'OSINT Recon', view: View.OSINT, path: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
      ]
    },
    {
      group: "Forensics & Reporting",
      items: [
        { label: 'AI Fusion Center', view: View.ANALYSIS, path: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" },
        { label: 'Evidence Locker', view: View.EVIDENCE, path: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
        { label: 'Reporting Hub', view: View.REPORTS, path: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      ]
    },
    {
      group: "Governance",
      items: [
        { label: 'Data Ingestion', view: View.INGESTION, path: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
        { label: 'Audit Compliance', view: View.AUDIT, path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
        { label: 'Platform Config', view: View.SYSTEM, path: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", clearance: 'TS/SCI' },
      ]
    }
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-950 border-r border-slate-800 transition-transform duration-300 md:relative md:translate-x-0 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="p-6 border-b border-slate-800 flex flex-col items-center shrink-0">
        <h1 className="text-lg font-bold text-white tracking-[0.2em] font-mono">{CONFIG.APP.NAME}</h1>
        <span className="text-[10px] text-cyan-500 font-mono tracking-widest mt-1">{CONFIG.APP.SUBTITLE}</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {navigation.map((group) => (
          <div key={group.group}>
            <div className="px-3 mb-3 flex items-center gap-2">
              <span className="h-px w-2 bg-slate-700"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                {group.group}
              </span>
            </div>
            <div className="space-y-0.5">
              {group.items.filter(i => !i.clearance || CONFIG.USER.CLEARANCE.includes(i.clearance)).map((item) => (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 group border-l-2 ${
                    currentView === item.view 
                      ? 'bg-cyan-900/10 text-cyan-400 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.05)]' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border-transparent hover:border-slate-700'
                  }`}
                >
                  <span className={`mr-3 ${currentView === item.view ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    <Icon path={item.path} />
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-900/50 rounded border border-slate-800">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
           <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">System Status</span>
              <span className="text-[10px] text-green-400 font-mono font-bold">OPERATIONAL</span>
           </div>
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
