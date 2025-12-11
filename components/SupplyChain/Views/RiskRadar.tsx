
import React, { useMemo } from 'react';
import { Card, CardHeader, StatusIndicator } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { Vendor } from '../../../types';
import { SupplyChainLogic } from '../../../services/logic/SupplyChainLogic';

interface Props {
  riskData: Vendor[];
  onSelect: (id: string) => void;
}

export const RiskRadar: React.FC<Props> = ({ riskData, onSelect }) => {
  const enrichedData = useMemo(() => {
    return riskData.map(v => ({
        ...v,
        riskAnalysis: SupplyChainLogic.calculateCompositeRisk(v)
    })).sort((a, b) => b.riskAnalysis.score - a.riskAnalysis.score);
  }, [riskData]);

  const criticalCount = enrichedData.filter(v => v.riskAnalysis.score > 75).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
            <CardHeader 
                title="Vendor Risk Matrix" 
                action={
                    <div className="flex gap-4 text-[10px]">
                        <span className="text-red-500 font-bold flex items-center gap-1"><StatusIndicator color="red" pulse /> Critical ({criticalCount})</span>
                        <span className="text-green-500 font-bold flex items-center gap-1"><StatusIndicator color="green" /> Stable</span>
                    </div>
                }
            />
            <div className="divide-y divide-slate-800 overflow-y-auto flex-1 custom-scrollbar">
                {enrichedData.map((v, i) => (
                    <div key={v.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-900/50 transition-colors group cursor-pointer" onClick={() => onSelect(v.id)}>
                        <div className="text-sm font-mono text-slate-600 w-8">#{i+1}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-white text-base truncate">{v.name}</span>
                                <span className={`font-mono font-bold ${v.riskAnalysis.score > 75 ? 'text-red-500' : v.riskAnalysis.score > 40 ? 'text-orange-500' : 'text-green-500'}`}>
                                    {v.riskAnalysis.score}/100
                                </span>
                            </div>
                            
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                                <div 
                                    className={`h-full ${v.riskAnalysis.score > 75 ? 'bg-red-500' : v.riskAnalysis.score > 40 ? 'bg-orange-500' : 'bg-green-500'}`} 
                                    style={{ width: `${v.riskAnalysis.score}%` }}
                                ></div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                                {v.riskAnalysis.factors.map((f, idx) => (
                                    <span key={idx} className="text-[9px] bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400 flex items-center gap-1" title={f.description}>
                                        <span className={`w-1 h-1 rounded-full ${f.impact > 15 ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                        {f.category}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex flex-row sm:flex-col gap-2 sm:gap-1 text-[10px] text-slate-500 uppercase font-bold sm:text-right shrink-0">
                            <span>{v.tier}</span>
                            <span className={v.category === 'Cloud' ? 'text-cyan-500' : ''}>{v.category}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
        
        <div className="space-y-4 flex flex-col h-full">
            <Card className="p-6 border-l-4 border-l-red-600 shrink-0">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest">Aggregate Exposure</h3>
                    <Icons.Activity className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-3xl font-mono font-bold text-white mb-2">{criticalCount > 0 ? 'CRITICAL' : 'ELEVATED'}</div>
                <p className="text-xs text-slate-400">
                    {criticalCount} Strategic vendors exceed risk threshold. Immediate audit recommended for {enrichedData[0]?.name || 'N/A'}.
                </p>
            </Card>
            
            <Card className="p-4 flex-1 overflow-hidden flex flex-col">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 shrink-0">Top Vulnerable Products</h3>
                <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                    {enrichedData.flatMap(v => v.sbom.filter(c => c.critical).map(c => ({ vendor: v.name, component: c.name, ver: c.version }))).map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-800">
                             <div className="flex flex-col">
                                 <span className="text-xs text-white font-bold">{item.component} v{item.ver}</span>
                                 <span className="text-[9px] text-slate-500">{item.vendor}</span>
                             </div>
                             <span className="text-[9px] bg-red-900/20 text-red-400 border border-red-900/50 px-1.5 py-0.5 rounded">CRITICAL</span>
                        </div>
                    ))}
                    {enrichedData.every(v => v.sbom.every(c => !c.critical)) && <div className="text-slate-500 text-xs italic text-center py-4">No critical components detected.</div>}
                </div>
            </Card>
        </div>
    </div>
  );
};
