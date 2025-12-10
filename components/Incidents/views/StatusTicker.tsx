
import React from 'react';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';

export const StatusTicker: React.FC = () => {
  const logs = useDataStore(() => threatData.getAuditLogs().slice(0, 5));
  
  return (
    <div className="bg-slate-950 border-b border-slate-800 py-1 overflow-hidden whitespace-nowrap flex items-center gap-4 shrink-0">
      <div className="text-[10px] font-bold text-red-500 px-4 animate-pulse">LIVE FEED</div>
      <div className="inline-block animate-[marquee_20s_linear_infinite] text-[10px] font-mono text-cyan-500/80">
        {logs.map((l, i) => <span key={i} className="mx-4">[{l.timestamp}] {l.action} :: {l.user} ({l.details})</span>)}
      </div>
    </div>
  );
};
