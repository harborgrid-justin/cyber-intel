
import React, { useState, useMemo } from 'react';
import { Card, Switch } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';

const EnrichmentView: React.FC = () => {
  const modules = useDataStore(() => threatData.getEnrichmentModules());
  const [estimatedEPS, setEstimatedEPS] = useState(100);

  const toggleModule = (id: string) => {
    threatData.toggleEnrichmentModule(id);
  };

  const projections = useMemo(() => {
    const active = modules.filter(m => m.enabled);
    const latency = active.reduce((sum, m) => sum + m.latencyMs, 0);
    // Calc: EPS * 60s * 60m * 24h * 30d * Cost
    const monthlyReqs = estimatedEPS * 2592000; 
    const cost = active.reduce((sum, m) => sum + (m.costPerRequest * monthlyReqs), 0);
    return { latency, cost, reqs: monthlyReqs };
  }, [modules, estimatedEPS]);

  return (
    <div className="space-y-6">
      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Pipeline Latency</div>
            <div className={`text-2xl font-bold font-mono ${projections.latency > 500 ? 'text-red-500' : projections.latency > 200 ? 'text-orange-500' : 'text-white'}`}>
              +{projections.latency}ms
            </div>
          </div>
          <Icons.Clock className="w-6 h-6 text-slate-600" />
        </Card>
        
        <Card className="p-4 flex items-center justify-between border-l-4 border-l-green-500">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Est. Monthly Cost</div>
            <div className="text-2xl font-bold font-mono text-white">
              ${projections.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <Icons.DollarSign className="w-6 h-6 text-slate-600" />
        </Card>

        <Card className="p-4 flex flex-col justify-center">
           <div className="flex justify-between items-center mb-2">
             <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Volume (EPS)</label>
             <span className="text-xs font-mono text-cyan-400 font-bold">{estimatedEPS} EPS</span>
           </div>
           <input 
             type="range" min="10" max="2000" step="10" 
             value={estimatedEPS} 
             onChange={(e) => setEstimatedEPS(parseInt(e.target.value))}
             className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
           />
           <div className="text-[9px] text-slate-600 text-right mt-1">~{(projections.reqs / 1000000).toFixed(1)}M Reqs/Mo</div>
        </Card>
      </div>

      {/* Visual Pipeline (Responsive) */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-4 pt-2">
        <div className="px-3 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400 border border-slate-700">RAW</div>
        {modules.filter(m => m.enabled).map((m, i) => (
          <React.Fragment key={m.id}>
            <div className="h-px w-4 bg-cyan-500/50"></div>
            <div className="px-3 py-2 bg-cyan-900/10 border border-cyan-900/50 text-cyan-400 rounded text-xs font-bold whitespace-nowrap shadow-[0_0_10px_rgba(6,182,212,0.1)] flex items-center gap-2">
              <span className="text-[9px] bg-cyan-900/30 px-1 rounded">{i+1}</span>
              {m.name}
            </div>
          </React.Fragment>
        ))}
        <div className="h-px w-4 bg-cyan-500/50"></div>
        <div className="px-3 py-1 bg-green-900/20 border border-green-900 text-green-400 rounded text-[10px] font-bold">INDEX</div>
      </div>

      {/* Active Modules List */}
      <div className="space-y-3">
        {modules.map(module => (
          <Card key={module.id} className={`p-4 transition-all duration-300 ${module.enabled ? 'bg-slate-900 border-cyan-900/30' : 'bg-slate-950 border-slate-800 opacity-70'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded border ${module.enabled ? 'bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-slate-900 border-slate-700 text-slate-600'}`}>
                  <Icons.Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${module.enabled ? 'text-white' : 'text-slate-500'}`}>{module.name}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-mono bg-slate-950 px-1.5 rounded text-[10px] border border-slate-800">{module.provider}</span>
                    <span className={module.latencyMs > 100 ? 'text-orange-400' : 'text-green-400'}>+{module.latencyMs}ms</span>
                    <span>${module.costPerRequest}/req</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 border-slate-800 pt-3 sm:pt-0">
                 <div className="text-right hidden sm:block">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Status</div>
                    <div className={`text-[10px] font-bold ${module.enabled ? 'text-cyan-400' : 'text-slate-600'}`}>
                      {module.enabled ? 'ACTIVE' : 'BYPASSED'}
                    </div>
                 </div>
                 <Switch checked={module.enabled} onChange={() => toggleModule(module.id)} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EnrichmentView;
