
import React from 'react';
import { InteractiveGraph } from '../Shared/InteractiveGraph';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';

export const CaseGraph: React.FC = () => {
  // Pull all active threats for a global view
  const threats = useDataStore(() => threatData.getThreats());
  
  return (
    <div className="h-full flex flex-col">
        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative">
            <InteractiveGraph threats={threats} />
            <div className="absolute bottom-4 left-4 bg-slate-900/80 p-3 rounded border border-slate-700 pointer-events-none">
                <h4 className="text-white font-bold text-xs uppercase mb-1">Graph Legend</h4>
                <div className="flex gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Threat</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-500 rounded-full"></span> Actor</span>
                </div>
            </div>
        </div>
    </div>
  );
};
