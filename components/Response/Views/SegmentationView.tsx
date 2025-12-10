
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, Badge, Button, Input, Label } from '../../Shared/UI';
import { SegmentationPolicy } from '../../../types';
import { OrchestratorLogic } from '../../../services/logic/OrchestratorLogic';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';

export const SegmentationView: React.FC = () => {
  const policies = useDataStore(() => threatData.getSegmentationPolicies());
  const trafficFlows = useDataStore(() => threatData.getTrafficFlows());
  
  const [isCreating, setIsCreating] = useState(false);
  const [newPolicy, setNewPolicy] = useState<Partial<SegmentationPolicy>>({ action: 'DENY', status: 'DRAFT' });
  const [simulationResult, setSimulationResult] = useState<{ id: string, blocked: number, services: string[] } | null>(null);
  const [lateralPaths, setLateralPaths] = useState<any[]>([]);

  useEffect(() => {
    OrchestratorLogic.detectLateralPaths().then(setLateralPaths);
  }, []);

  const handleSimulate = async (policy: SegmentationPolicy) => {
    const result = await OrchestratorLogic.simulatePolicy(policy, trafficFlows);
    setSimulationResult({
      id: policy.id,
      blocked: result.blockedCount,
      services: result.affectedServices
    });
  };

  const handleCreate = () => {
      if(newPolicy.name && newPolicy.source && newPolicy.destination) {
          threatData.addSegmentationPolicy({ ...newPolicy, id: `POL-${Date.now()}`, port: newPolicy.port || '*' } as SegmentationPolicy);
          setIsCreating(false);
          setNewPolicy({ action: 'DENY', status: 'DRAFT' });
      }
  };

  const handleAutoSegment = (path: { path: string[], risk: number }) => {
      const src = path.path[0];
      const dst = path.path[path.path.length - 1];
      setNewPolicy({
          name: `AUTO: Block ${src} -> ${dst}`,
          source: src,
          destination: dst,
          port: '*',
          action: 'DENY',
          status: 'DRAFT'
      });
      setIsCreating(true);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
         <Card className="lg:col-span-2 p-0 overflow-hidden">
            <CardHeader 
              title="Active Segmentation Policies" 
              action={<Button onClick={() => setIsCreating(true)} variant="primary" className="text-[10px] py-1">+ NEW POLICY</Button>}
            />
            {isCreating && (
                <div className="p-4 bg-slate-900 border-b border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-3 items-end animate-in fade-in slide-in-from-top-2">
                    <div className="md:col-span-1"><Label>Name</Label><Input value={newPolicy.name || ''} onChange={e => setNewPolicy({...newPolicy, name: e.target.value})} className="text-xs" placeholder="Policy Name" /></div>
                    <div><Label>Source</Label><Input value={newPolicy.source || ''} onChange={e => setNewPolicy({...newPolicy, source: e.target.value})} className="text-xs" placeholder="Src Tag/IP" /></div>
                    <div><Label>Dest</Label><Input value={newPolicy.destination || ''} onChange={e => setNewPolicy({...newPolicy, destination: e.target.value})} className="text-xs" placeholder="Dst Tag/IP" /></div>
                    <div><Label>Port</Label><Input value={newPolicy.port || ''} onChange={e => setNewPolicy({...newPolicy, port: e.target.value})} className="text-xs" placeholder="*" /></div>
                    <div className="flex gap-1">
                        <Button onClick={handleCreate} className="text-[10px] h-[34px]">SAVE</Button>
                        <Button onClick={() => setIsCreating(false)} variant="text" className="text-[10px] h-[34px]">X</Button>
                    </div>
                </div>
            )}
            <div className="p-4">
               <ResponsiveTable<SegmentationPolicy>
                  data={policies}
                  keyExtractor={p => p.id}
                  columns={[
                     { header: 'Rule Name', render: p => <span className="text-white font-bold text-xs">{p.name}</span> },
                     { header: 'Source', render: p => <Badge color="slate">{p.source}</Badge> },
                     { header: 'Dest', render: p => <Badge color="slate">{p.destination}</Badge> },
                     { header: 'Port', render: p => <span className="font-mono text-xs">{p.port}</span> },
                     { header: 'Action', render: p => <Badge color={p.action === 'ALLOW' ? 'green' : 'red'}>{p.action}</Badge> },
                     { header: 'Simulate', render: p => <Button onClick={() => handleSimulate(p)} variant="secondary" className="text-[10px] py-1">TEST</Button> }
                  ]}
                  renderMobileCard={p => <div>{p.name}</div>}
               />
            </div>
         </Card>

         <Card className="p-0 overflow-hidden flex flex-col">
            <CardHeader title="Simulation Results" />
            <div className="p-6 flex-1 flex items-center justify-center">
               {simulationResult ? (
                 <div className="text-center w-full animate-in fade-in zoom-in duration-300">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Policy Impact Analysis</div>
                    <div className="text-4xl font-mono text-white font-bold mb-4">{simulationResult.blocked}</div>
                    <div className="text-xs text-slate-400 mb-4">Flows would be blocked</div>
                    
                    {simulationResult.blocked > 0 && (
                      <div className="bg-red-900/10 border border-red-900/50 p-3 rounded text-left">
                         <div className="text-[10px] text-red-400 font-bold uppercase mb-1">Affected Services</div>
                         <ul className="text-xs text-red-300 list-disc pl-4">
                            {simulationResult.services.slice(0,3).map(s => <li key={s}>{s}</li>)}
                            {simulationResult.services.length > 3 && <li>...and {simulationResult.services.length - 3} more</li>}
                         </ul>
                      </div>
                    )}
                    {simulationResult.blocked === 0 && <div className="text-green-500 text-xs font-bold bg-green-900/10 p-2 rounded border border-green-900/30">Safe to Apply (No Impacts)</div>}
                 </div>
               ) : (
                 <div className="text-slate-600 text-center">
                    <div className="text-4xl mb-2">?</div>
                    <div className="text-xs uppercase tracking-widest font-bold">Select a policy to simulate</div>
                 </div>
               )}
            </div>
         </Card>
      </div>

      <Card className="flex-1 p-0 overflow-hidden flex flex-col border-t-4 border-t-orange-500">
         <CardHeader title="Lateral Movement Paths (Zone Breaches)" action={<Badge color="orange">{lateralPaths.length} Detected</Badge>} />
         <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto custom-scrollbar">
            {lateralPaths.length > 0 ? lateralPaths.map((path, i) => (
               <div key={i} className={`bg-slate-900 border border-slate-800 p-4 rounded flex flex-col gap-2 transition-colors ${path.risk > 90 ? 'border-red-500/50 bg-red-900/5' : 'hover:border-red-500/30'}`}>
                  <div className="flex justify-between items-center">
                      <Badge color="red">RISK: {path.risk}</Badge>
                      <span className="text-[9px] text-slate-500 uppercase">Unsegmented Path</span>
                  </div>
                  <div className="flex flex-col gap-1 my-2">
                     {path.path.map((node: string, idx: number) => (
                         <div key={idx} className="flex items-center text-xs">
                             <span className={`font-bold ${idx === 0 ? 'text-red-400' : idx === path.path.length-1 ? 'text-cyan-400' : 'text-slate-400'}`}>{node}</span>
                             {idx < path.path.length - 1 && <span className="text-slate-600 mx-2">↓</span>}
                         </div>
                     ))}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 italic">{path.details}</div>
                  <Button onClick={() => handleAutoSegment(path)} variant="secondary" className="mt-2 text-[10px]">AUTO-SEGMENT</Button>
               </div>
            )) : <div className="col-span-full text-center text-slate-500 p-8">No unsegmented paths detected.</div>}
         </div>
      </Card>
    </div>
  );
};
