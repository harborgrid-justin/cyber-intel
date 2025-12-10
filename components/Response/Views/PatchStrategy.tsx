
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Badge, Button } from '../../Shared/UI';
import { PatchPrioritization } from '../../../types';
import { threatData } from '../../../services/dataLayer';
import { OrchestratorLogic } from '../../../services/logic/OrchestratorLogic';

interface Props {
  prioritizedPatches: PatchPrioritization[]; // Kept for interface compatibility but we fetch fresh
}

export const PatchStrategy: React.FC<Props> = () => {
  const [patchingIds, setPatchingIds] = useState<string[]>([]);
  const [patches, setPatches] = useState<PatchPrioritization[]>([]);

  useEffect(() => {
    OrchestratorLogic.prioritizePatches().then(setPatches);
  }, []);

  const handlePatch = (vulnId: string, assetId: string) => {
      const key = `${vulnId}-${assetId}`;
      setPatchingIds(prev => [...prev, key]);
      
      // Simulate patching process
      setTimeout(() => {
          // Update data layer
          threatData.updateVulnerabilityStatus(vulnId, 'PATCHED');
          setPatchingIds(prev => prev.filter(k => k !== key));
          alert(`Patch applied for ${vulnId} on ${assetId}. Verification scheduled.`);
          // Refresh list
          OrchestratorLogic.prioritizePatches().then(setPatches);
      }, 1500);
  };

  // Sort by score descending
  const sortedPatches = [...patches].sort((a, b) => b.score - a.score);

  return (
    <Card className="lg:h-full h-[500px] p-0 overflow-hidden flex flex-col">
        <CardHeader 
            title="Risk-Based Prioritization Queue"
            action={<Badge color="red">{sortedPatches.filter(p => p.businessCriticality === 'CRITICAL').length} Critical Actions</Badge>}
        />
        <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
            {sortedPatches.map((p, i) => {
                const isPatching = patchingIds.includes(`${p.vulnId}-${p.assetId}`);
                return (
                    <div key={`${p.vulnId}-${p.assetId}`} className={`flex flex-col md:flex-row md:items-center gap-4 p-4 bg-slate-900 border rounded transition-all ${isPatching ? 'border-green-500 bg-green-900/10 opacity-50' : 'border-slate-800 hover:border-cyan-500'}`}>
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="text-2xl font-bold text-slate-700 w-8">{i + 1}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                    <span className="font-bold text-white truncate text-sm">{p.vulnId}</span>
                                    <span className="text-[10px] text-slate-400 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Asset: {p.assetId}</span>
                                </div>
                                <div className="text-xs text-slate-400 truncate flex items-center gap-2">
                                    <span className="text-slate-500">Context:</span> {p.reason}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <Badge color={p.businessCriticality === 'CRITICAL' ? 'red' : p.businessCriticality === 'HIGH' ? 'orange' : 'yellow'}>{p.businessCriticality} IMPACT</Badge>
                                <span className="text-[10px] font-bold text-slate-500">Risk Score: {p.score.toFixed(0)}</span>
                            </div>
                            <Button 
                                onClick={() => handlePatch(p.vulnId, p.assetId)} 
                                disabled={isPatching}
                                variant="primary" 
                                className="text-[10px] py-1 h-8 shrink-0 min-w-[80px]"
                            >
                                {isPatching ? 'PATCHING...' : 'APPLY PATCH'}
                            </Button>
                        </div>
                    </div>
                );
            })}
            {sortedPatches.length === 0 && <div className="text-center text-slate-500 py-12">No pending patches required.</div>}
        </div>
    </Card>
  );
};
