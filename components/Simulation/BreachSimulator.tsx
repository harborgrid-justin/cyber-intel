
import React, { useState } from 'react';
import { Card, Button, Badge, Select, FilterGroup, ProgressBar, Grid, CardHeader, Label } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { DefenseLogic } from '../../services/logic/DefenseLogic';
import { StandardPage } from '../Shared/Layouts';
import { AttackPath } from '../../types';
import { Icons } from '../Shared/Icons';

const BreachSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PATH' | 'EVASION' | 'EXFIL' | 'BUILDER'>('PATH');
  const [selectedActorId, setSelectedActorId] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<AttackPath | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const actors = threatData.getActors();
  const nodes = threatData.getSystemNodes();
  const vulns = threatData.getVulnerabilities();

  const handleSimulate = () => {
    if (!selectedActorId) return;
    setIsSimulating(true);
    setSimulationResult(null);
    setTimeout(() => {
       const actor = actors.find(a => a.id === selectedActorId);
       if (actor) {
         const result = DefenseLogic.simulateBreach(actor, nodes, vulns);
         setSimulationResult(result);
       }
       setIsSimulating(false);
    }, 1500);
  };

  const selectedActor = actors.find(a => a.id === selectedActorId);

  return (
    <StandardPage title="Breach Simulator 2.0" subtitle="Adversary Emulation & Impact Analysis" modules={[]} activeModule="" onModuleChange={() => {}}>
      <div className="flex flex-col h-full gap-6">
        
        <Card className="p-6 shrink-0 bg-slate-900 border-cyan-900/30">
           <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                 <Label>Adversary Profile</Label>
                 <Select value={selectedActorId} onChange={e => setSelectedActorId(e.target.value)}>
                    <option value="">-- Select Threat Actor --</option>
                    {actors.map(a => <option key={a.id} value={a.id}>{a.name} ({a.origin}) - {a.sophistication}</option>)}
                 </Select>
              </div>
              <div className="flex-1 w-full">
                 <Label>Simulation Scope</Label>
                 <FilterGroup value={activeTab} onChange={(v: any) => setActiveTab(v)} options={[
                    { label: 'Attack Path', value: 'PATH', icon: <Icons.Zap className="w-3 h-3" /> },
                    { label: 'Evasion Matrix', value: 'EVASION', icon: <Icons.Shield className="w-3 h-3" /> },
                    { label: 'Exfil Calculator', value: 'EXFIL', icon: <Icons.HardDrive className="w-3 h-3" /> },
                    { label: 'Red Team Builder', value: 'BUILDER', icon: <Icons.Tool className="w-3 h-3" /> }
                 ]} />
              </div>
              <Button onClick={handleSimulate} disabled={!selectedActorId || isSimulating} variant="primary" className="w-full md:w-auto">
                 {isSimulating ? 'RUNNING SIM...' : 'EXECUTE WARGAME'}
              </Button>
           </div>
        </Card>

        <div className="flex-1 min-h-0 overflow-hidden">
           
           {activeTab === 'PATH' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center">
                   {simulationResult ? (
                      <div className="relative w-full h-full p-8 flex items-center">
                         <svg className="w-full h-full absolute inset-0 pointer-events-none"><defs><marker id="arrow-red" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#ef4444" /></marker></defs><line x1="20%" y1="50%" x2="50%" y2="50%" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" className="animate-[dash_1s_linear_infinite]" strokeDasharray="5" /><line x1="50%" y1="50%" x2="80%" y2="50%" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" className="animate-[dash_1s_linear_infinite] delay-500" strokeDasharray="5" /></svg>
                         <div className="flex justify-between w-full relative z-10">
                            <div className="bg-slate-900 border border-red-500 p-4 rounded shadow-[0_0_20px_rgba(239,68,68,0.2)] text-center flex flex-col items-center gap-2">
                                <Icons.UserX className="w-8 h-8 text-red-500" />
                                <div className="text-red-400 font-bold text-xs uppercase">{selectedActor?.name}</div>
                            </div>
                            <div className="bg-slate-900 border border-orange-500 p-4 rounded text-center flex flex-col items-center gap-2">
                                <Icons.Monitor className="w-8 h-8 text-orange-500" />
                                <div className="text-orange-400 font-bold text-xs uppercase">Lateral Mov</div>
                            </div>
                            <div className="bg-slate-900 border border-purple-500 p-4 rounded shadow-[0_0_20px_rgba(168,85,247,0.2)] text-center flex flex-col items-center gap-2">
                                <Icons.Database className="w-8 h-8 text-purple-500" />
                                <div className="text-purple-400 font-bold text-xs uppercase">Target DB</div>
                            </div>
                         </div>
                      </div>
                   ) : <div className="text-slate-600 font-bold uppercase tracking-widest text-sm">Awaiting Simulation</div>}
                </div>
                <Card className="flex flex-col overflow-hidden">
                   <CardHeader title="Kill Chain Log" />
                   <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative">
                      {simulationResult ? simulationResult.steps.map((step, i) => (
                         <div key={i} className="relative pl-6 border-l-2 border-red-900/50">
                            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                            <div className="text-[10px] text-red-400 font-bold uppercase mb-1">{step.stage}</div>
                            <div className="text-white font-bold text-sm mb-1">{step.method}</div>
                            <div className="text-xs text-slate-400">{step.description}</div>
                            <div className="mt-2 flex gap-2"><Badge color={step.successProbability > 0.8 ? 'red' : 'orange'}>Prob: {(step.successProbability * 100).toFixed(0)}%</Badge></div>
                         </div>
                      )) : <div className="text-center text-slate-600 text-xs py-8">No data.</div>}
                   </div>
                </Card>
             </div>
           )}

           {activeTab === 'EVASION' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto">
               <Card className="p-6">
                  <h3 className="font-bold text-white mb-4">Adversary Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                     {selectedActor?.evasionTechniques?.map(t => <Badge key={t} color="purple">{t}</Badge>) || <span className="text-slate-500 italic">No specific evasion TTPs known.</span>}
                  </div>
                  <div className="mt-6 space-y-4">
                     <div><div className="flex justify-between text-xs text-slate-400 mb-1"><span>EDR Bypass Probability</span><span>High</span></div><ProgressBar value={85} color="red" /></div>
                     <div><div className="flex justify-between text-xs text-slate-400 mb-1"><span>Firewall Evasion</span><span>Medium</span></div><ProgressBar value={45} color="orange" /></div>
                  </div>
               </Card>
               <div className="space-y-4">
                  {nodes.map(node => {
                     const prob = selectedActor ? DefenseLogic.calculateEvasionProbability(selectedActor, node) : 0;
                     return (
                        <Card key={node.id} className="p-4 flex items-center justify-between">
                           <div>
                              <div className="font-bold text-white">{node.name}</div>
                              <div className="text-xs text-slate-500">Controls: {node.securityControls.join(', ')}</div>
                           </div>
                           <div className="text-right">
                              <div className={`text-xl font-bold ${prob > 0.7 ? 'text-red-500' : 'text-green-500'}`}>{(prob * 100).toFixed(0)}%</div>
                              <div className="text-[10px] text-slate-600 uppercase">Bypass Chance</div>
                           </div>
                        </Card>
                     );
                  })}
               </div>
             </div>
           )}

           {activeTab === 'EXFIL' && (
             <Card className="h-full p-6 overflow-y-auto">
                <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-sm">Data Loss Physics Engine</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {nodes.filter(n => n.dataVolumeGB > 0).map(n => (
                      <div key={n.id} className="bg-slate-950 border border-slate-800 rounded p-4">
                         <div className="flex justify-between mb-2">
                            <span className="text-cyan-400 font-mono font-bold">{n.name}</span>
                            <Badge color={n.dataSensitivity === 'RESTRICTED' ? 'red' : 'orange'}>{n.dataSensitivity}</Badge>
                         </div>
                         <div className="text-2xl font-bold text-white mb-1">{n.dataVolumeGB} GB</div>
                         <div className="text-xs text-slate-500 mb-4">Est. Exfil Time (@100Mbps): <span className="text-white">{DefenseLogic.estimateExfiltrationTime(n)}</span></div>
                         <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 animate-pulse" style={{ width: '100%' }}></div>
                         </div>
                      </div>
                   ))}
                </div>
             </Card>
           )}

           {activeTab === 'BUILDER' && (
             <div className="flex h-full gap-6">
                <Card className="w-1/3 p-0 overflow-hidden flex flex-col">
                   <CardHeader title="TTP Library" />
                   <div className="p-4 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                      {['Phishing', 'Brute Force', 'Exploit Public App', 'OS Credential Dump', 'SMB Lateral', 'Data Encrypted'].map(t => (
                         <div key={t} className="p-2 bg-slate-950 border border-slate-700 rounded text-xs text-slate-300 cursor-grab active:cursor-grabbing hover:border-cyan-500">
                            {t}
                         </div>
                      ))}
                   </div>
                </Card>
                <Card className="flex-1 p-0 overflow-hidden border-dashed border-2 flex flex-col">
                   <CardHeader title="Campaign Canvas" />
                   <div className="flex-1 flex flex-col items-center justify-center text-slate-600 bg-slate-950/50">
                      <Icons.Tool className="w-12 h-12 mb-2 opacity-50" />
                      <div className="text-sm font-bold uppercase tracking-widest">Drag TTPs here to build custom campaign</div>
                   </div>
                </Card>
             </div>
           )}

        </div>
      </div>
    </StandardPage>
  );
};
export default BreachSimulator;
