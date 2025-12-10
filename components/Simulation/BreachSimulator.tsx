
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Select, FilterGroup, ProgressBar, CardHeader, Label, Grid } from '../Shared/UI';
import { StandardPage } from '../Shared/Layouts';
import { Icons } from '../Shared/Icons';
import { useBreachSimulation } from '../../hooks/modules/useBreachSimulation';
import { SimPathLogic } from '../../services/logic/SimPathLogic';
import { SimExfilLogic } from '../../services/logic/SimExfilLogic';
import CampaignBuilder from './CampaignBuilder';
import { PathVisualizer } from './PathVisualizer';
import { ErrorState } from '../Shared/ErrorState';

const BreachSimulator: React.FC = () => {
  const {
    activeTab, setActiveTab,
    isSimulating, results, error, runSimulation,
    actors, nodes,
    exfilConfig, setExfilConfig,
    exfilPhysics, calculateExfil
  } = useBreachSimulation();

  const [selectedActorId, setSelectedActorId] = useState<string>('');
  const [exfilNodeId, setExfilNodeId] = useState<string>('');

  // Effect to trigger physics recalc when config changes
  useEffect(() => {
    calculateExfil(exfilNodeId);
  }, [exfilNodeId, exfilConfig, calculateExfil]);

  return (
    <StandardPage title="Breach Simulator 2.0" subtitle="Adversary Emulation & Impact Analysis" modules={[]} activeModule="" onModuleChange={() => {}}>
      <div className="flex flex-col h-full gap-6">
        
        {/* Controls */}
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
                 <FilterGroup value={activeTab} onChange={(v: string) => setActiveTab(v as any)} options={[
                    { label: 'Attack Path', value: 'PATH', icon: <Icons.Zap className="w-3 h-3" /> },
                    { label: 'Evasion Matrix', value: 'EVASION', icon: <Icons.Shield className="w-3 h-3" /> },
                    { label: 'Exfil Physics', value: 'EXFIL', icon: <Icons.HardDrive className="w-3 h-3" /> },
                    { label: 'Red Team Builder', value: 'BUILDER', icon: <Icons.Tool className="w-3 h-3" /> }
                 ]} />
              </div>
              <Button onClick={() => runSimulation(selectedActorId)} disabled={(!selectedActorId && activeTab !== 'BUILDER' && activeTab !== 'EXFIL') || isSimulating} variant="primary" className="w-full md:w-auto min-w-[160px]">
                 {isSimulating ? 'RUNNING SIM...' : 'EXECUTE WARGAME'}
              </Button>
           </div>
        </Card>

        <div className="flex-1 min-h-0 overflow-hidden">
           {error && <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-300 text-xs font-bold">{error}</div>}

           {/* Path View */}
           {activeTab === 'PATH' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[400px]">
                   {isSimulating ? (
                      <div className="flex flex-col items-center gap-4 animate-pulse">
                         <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                         <div className="text-cyan-500 font-mono text-xs uppercase tracking-widest">Simulating Attack Vectors...</div>
                      </div>
                   ) : results ? (
                      <div className="relative w-full h-full p-8 flex items-center justify-center flex-col">
                         <PathVisualizer paths={results.paths} nodes={nodes} chokePoints={results.chokePoints} />
                      </div>
                   ) : <div className="text-slate-600 font-bold uppercase tracking-widest text-sm text-center">Select Actor & Execute</div>}
                </div>
                <Card className="flex flex-col overflow-hidden h-[400px] lg:h-auto">
                   <CardHeader title="Probable Attack Vector" />
                   <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                      {results && results.paths && results.paths[0] ? (
                          SimPathLogic.mapToSteps(results.paths[0].path, nodes).map((step, i) => (
                            <div key={i} className="relative pl-6 border-l-2 border-red-900/50">
                                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                <div className="text-[10px] text-red-400 font-bold uppercase mb-1">{step.stage}</div>
                                <div className="text-white font-bold text-sm mb-1">{step.method}</div>
                                <div className="text-xs text-slate-400">{step.description}</div>
                                <div className="mt-2 flex gap-2"><Badge color={step.successProbability > 0.7 ? 'red' : 'orange'}>Success: {(step.successProbability * 100).toFixed(0)}%</Badge></div>
                            </div>
                          ))
                      ) : <div className="text-center text-slate-600 text-xs py-8">No path data available.</div>}
                   </div>
                </Card>
             </div>
           )}

           {/* Evasion View */}
           {activeTab === 'EVASION' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto custom-scrollbar">
               <div className="space-y-4">
                  {results ? results.evasionBreakdown.map((item, idx) => (
                     <Card key={idx} className="p-4">
                        <div className="flex justify-between items-center mb-4">
                           <div className="font-bold text-white">{item.node}</div>
                           <div className="text-right">
                              <div className={`text-xl font-bold ${item.score > 0.7 ? 'text-red-500' : 'text-green-500'}`}>{(item.score * 100).toFixed(0)}%</div>
                              <div className="text-[10px] text-slate-600 uppercase">Overall Bypass</div>
                           </div>
                        </div>
                        <div className="space-y-3">
                           {item.details.map((d, i) => (
                              <div key={i}>
                                 <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>{d.control}</span>
                                    <span>{d.score.toFixed(0)}%</span>
                                 </div>
                                 <ProgressBar value={d.score} color={d.score > 70 ? 'red' : d.score > 40 ? 'orange' : 'green'} />
                              </div>
                           ))}
                        </div>
                     </Card>
                  )) : <ErrorState title="Awaiting Simulation" message="Run a simulation to see evasion metrics." />}
               </div>
               
               <Card className="p-6 h-fit">
                  <h3 className="font-bold text-white mb-4">Adversary Capabilities</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                     {actors.find(a => a.id === selectedActorId)?.evasionTechniques?.map(t => <Badge key={t} color="purple">{t}</Badge>) || <span className="text-slate-500 italic">No specific evasion TTPs known.</span>}
                  </div>
               </Card>
             </div>
           )}

           {/* Exfil View */}
           {activeTab === 'EXFIL' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <Card className="p-0 overflow-hidden flex flex-col">
                    <CardHeader title="Exfiltration Logic" />
                    <div className="p-6 space-y-6">
                        <div>
                            <Label>Target Asset</Label>
                            <Select value={exfilNodeId} onChange={e => setExfilNodeId(e.target.value)}>
                                <option value="">-- Select Target Data Source --</option>
                                {nodes.filter(n => n.dataVolumeGB > 0).map(n => <option key={n.id} value={n.id}>{n.name} ({n.dataVolumeGB} GB)</option>)}
                            </Select>
                        </div>
                        <div>
                            <Label>Exfil Protocol</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {SimExfilLogic.getProtocolOptions().map(p => (
                                    <button key={p} onClick={() => setExfilConfig({...exfilConfig, protocol: p as any})} className={`p-2 rounded text-xs font-bold border ${exfilConfig.protocol === p ? 'bg-cyan-900/50 border-cyan-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>{p}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label>Encryption</Label>
                            <Select value={exfilConfig.encryption} onChange={e => setExfilConfig({...exfilConfig, encryption: e.target.value as any})}>
                                <option value="NONE">None (Cleartext)</option>
                                <option value="AES">AES-256 (High Entropy)</option>
                                <option value="XOR">Rolling XOR (Obfuscated)</option>
                            </Select>
                        </div>
                    </div>
                </Card>

                {exfilPhysics ? (
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <Grid cols={3}>
                            <Card className="p-4 bg-slate-900 border-l-4 border-l-cyan-500">
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Est. Duration</div>
                                <div className="text-2xl font-mono text-white font-bold">{exfilPhysics.duration}</div>
                            </Card>
                            <Card className="p-4 bg-slate-900 border-l-4 border-l-purple-500">
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Total Payload</div>
                                <div className="text-2xl font-mono text-white font-bold">{exfilPhysics.totalSize}</div>
                            </Card>
                            <Card className="p-4 bg-slate-900 border-l-4 border-l-red-500">
                                <div className="text-[10px] text-slate-500 uppercase font-bold">Detection Risk</div>
                                <div className="text-2xl font-mono text-white font-bold">{exfilPhysics.detectionScore}%</div>
                            </Card>
                        </Grid>
                        
                        <Card className="flex-1 p-0 overflow-hidden relative">
                             <CardHeader title="Physics Simulation Stream" />
                             <div className="p-6 h-full bg-slate-950 font-mono text-xs text-green-400 space-y-1 overflow-hidden relative">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                <div>&gt; INIT_EXFIL target={exfilNodeId} proto={exfilConfig.protocol}</div>
                                <div>&gt; CHUNK_SIZE={exfilConfig.chunkSize}KB JITTER={exfilConfig.jitter}</div>
                                <div>&gt; ENTROPY: {exfilConfig.encryption === 'AES' ? 'HIGH (8.2)' : 'LOW (3.5)'}</div>
                                <div className="text-yellow-500">&gt; WARNING: Overhead {exfilPhysics.overheadPct} detected.</div>
                                <div>&gt; EST_PACKETS: {exfilPhysics.packets}</div>
                                <div className="animate-pulse">&gt; STREAMING_DATA... [====================] 100%</div>
                            </div>
                        </Card>
                    </div>
                ) : <div className="lg:col-span-2 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">Select a Target Asset to Calculate Physics</div>}
             </div>
           )}

           {activeTab === 'BUILDER' && <CampaignBuilder />}

        </div>
      </div>
    </StandardPage>
  );
};
export default BreachSimulator;
