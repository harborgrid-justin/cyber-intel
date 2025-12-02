
import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Select, FilterGroup, ProgressBar, CardHeader, Label, Input, Grid } from '../Shared/UI';
import { threatData } from '../../services-frontend/dataLayer';
import { StandardPage } from '../Shared/Layouts';
import { Icons } from '../Shared/Icons';
import { SimPathLogic } from '../../services-frontend/logic/SimPathLogic';
import { SimEvasionLogic } from '../../services-frontend/logic/SimEvasionLogic';
import { SimExfilLogic, ExfilConfig } from '../../services-frontend/logic/SimExfilLogic';
import CampaignBuilder from './CampaignBuilder';

const BreachSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PATH' | 'EVASION' | 'EXFIL' | 'BUILDER'>('PATH');
  const [selectedActorId, setSelectedActorId] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  
  // Exfil Advanced Controls
  const [exfilNodeId, setExfilNodeId] = useState<string>('');
  const [exfilConfig, setExfilConfig] = useState<ExfilConfig>({
      protocol: 'HTTPS', encryption: 'AES', chunkSize: 64, jitter: 0.1, bandwidthLimit: 100
  });

  const actors = threatData.getActors();
  const nodes = threatData.getSystemNodes();
  const selectedActor = actors.find(a => a.id === selectedActorId);

  // Computed Physics
  const exfilPhysics = useMemo(() => {
      const targetNode = nodes.find(n => n.id === exfilNodeId) || nodes.find(n => n.type === 'Database') || nodes[0];
      if (!targetNode) return null;
      return SimExfilLogic.calculatePhysics(targetNode, exfilConfig);
  }, [exfilNodeId, exfilConfig, nodes]);

  const handleSimulate = () => {
    if (!selectedActorId) return;
    setIsSimulating(true);
    setSimulationResults(null); 

    setTimeout(() => {
        const target = nodes.find(n => n.type === 'Database') || nodes[0];
        const entry = nodes.find(n => n.type === 'Workstation') || nodes[nodes.length-1];
        const currentActor = threatData.getActors().find(a => a.id === selectedActorId) || actors[0];

        const paths = SimPathLogic.findAttackPaths(entry.id, target.id, nodes, currentActor);
        const chokePoints = SimPathLogic.identifyChokePoints(paths);
        
        const evasionBreakdown = nodes.map(n => ({
          node: n.name,
          score: SimEvasionLogic.calculateOverallEvasion(currentActor, n),
          details: SimEvasionLogic.getEvasionBreakdown(currentActor, n)
        }));

        setSimulationResults({ paths, chokePoints, evasionBreakdown });
        setIsSimulating(false);
    }, 1500); 
  };

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
                    { label: 'Exfil Physics', value: 'EXFIL', icon: <Icons.HardDrive className="w-3 h-3" /> },
                    { label: 'Red Team Builder', value: 'BUILDER', icon: <Icons.Tool className="w-3 h-3" /> }
                 ]} />
              </div>
              <Button onClick={handleSimulate} disabled={(!selectedActorId && activeTab !== 'BUILDER' && activeTab !== 'EXFIL') || isSimulating} variant="primary" className="w-full md:w-auto min-w-[160px]">
                 {isSimulating ? 'RUNNING SIM...' : 'EXECUTE WARGAME'}
              </Button>
           </div>
        </Card>

        <div className="flex-1 min-h-0 overflow-hidden">
           {activeTab === 'PATH' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[400px]">
                   {isSimulating ? (
                      <div className="flex flex-col items-center gap-4 animate-pulse">
                         <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                         <div className="text-cyan-500 font-mono text-xs uppercase tracking-widest">Simulating Attack Vectors...</div>
                      </div>
                   ) : simulationResults ? (
                      <div className="relative w-full h-full p-8 flex items-center justify-center flex-col">
                         {simulationResults.paths && simulationResults.paths.length > 0 ? (
                            <>
                                <div className="flex justify-between w-full relative z-10 max-w-2xl">
                                    {simulationResults.paths[0].path.map((nodeId: string, i: number) => {
                                        const node = nodes.find(n => n.id === nodeId);
                                        return (
                                            <React.Fragment key={nodeId}>
                                                <div className="bg-slate-900 border border-red-500 p-4 rounded text-center flex flex-col items-center gap-2 w-32 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${i*200}ms` }}>
                                                    <div className="text-red-400 font-bold text-[10px] uppercase">Step {i+1}</div>
                                                    <Icons.Server className="w-6 h-6 text-white" />
                                                    <div className="text-white font-bold text-xs truncate w-full">{node?.name}</div>
                                                </div>
                                                {i < simulationResults.paths[0].path.length - 1 && (
                                                    <div className="flex-1 flex items-center px-2">
                                                        <div className="h-0.5 bg-red-500 w-full animate-pulse"></div>
                                                        <div className="text-[9px] text-red-400 -mt-4 bg-slate-950 px-1">LATERAL</div>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                                <div className="mt-12 w-full max-w-2xl bg-slate-900/50 p-4 rounded border border-slate-800">
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Choke Point Analysis</div>
                                    <div className="flex gap-4">
                                        {Array.from(simulationResults.chokePoints.entries()).map(([nid, count]: any) => {
                                            const nodeName = nodes.find(n => n.id === nid)?.name;
                                            return count > 1 ? (
                                                <Badge key={nid} color="orange">Critical Node: {nodeName} ({count} paths)</Badge>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </>
                         ) : (
                            <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                                <Icons.AlertTriangle className="w-10 h-10 opacity-50" />
                                <div className="text-sm font-bold uppercase tracking-widest">No viable attack path found</div>
                            </div>
                         )}
                      </div>
                   ) : <div className="text-slate-600 font-bold uppercase tracking-widest text-sm text-center">Select Actor & Execute</div>}
                </div>
                <Card className="flex flex-col overflow-hidden h-[400px] lg:h-auto">
                   <CardHeader title="Probable Attack Vector" />
                   <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                      {simulationResults && simulationResults.paths && simulationResults.paths[0] ? (
                          SimPathLogic.mapToSteps(simulationResults.paths[0].path, nodes).map((step, i) => (
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

           {activeTab === 'EVASION' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto custom-scrollbar">
               <div className="space-y-4">
                  {simulationResults ? simulationResults.evasionBreakdown.map((item: any, idx: number) => (
                     <Card key={idx} className="p-4">
                        <div className="flex justify-between items-center mb-4">
                           <div className="font-bold text-white">{item.node}</div>
                           <div className="text-right">
                              <div className={`text-xl font-bold ${item.score > 0.7 ? 'text-red-500' : 'text-green-500'}`}>{(item.score * 100).toFixed(0)}%</div>
                              <div className="text-[10px] text-slate-600 uppercase">Overall Bypass</div>
                           </div>
                        </div>
                        <div className="space-y-3">
                           {item.details.map((d: any, i: number) => (
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
                  )) : <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded">Run simulation to see evasion metrics</div>}
               </div>
               
               <Card className="p-6 h-fit">
                  <h3 className="font-bold text-white mb-4">Adversary Capabilities</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                     {selectedActor?.evasionTechniques?.map(t => <Badge key={t} color="purple">{t}</Badge>) || <span className="text-slate-500 italic">No specific evasion TTPs known.</span>}
                  </div>
               </Card>
             </div>
           )}

           {activeTab === 'EXFIL' && exfilPhysics && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Configuration Panel */}
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
                            <Label>Encryption & Encoding</Label>
                            <Select value={exfilConfig.encryption} onChange={e => setExfilConfig({...exfilConfig, encryption: e.target.value as any})}>
                                <option value="NONE">None (Cleartext)</option>
                                <option value="AES">AES-256 (High Entropy)</option>
                                <option value="XOR">Rolling XOR (Obfuscated)</option>
                            </Select>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1"><Label>Bandwidth Limit</Label><span className="text-xs font-mono text-cyan-400">{exfilConfig.bandwidthLimit} Mbps</span></div>
                            <input type="range" min="1" max="1000" value={exfilConfig.bandwidthLimit} onChange={e => setExfilConfig({...exfilConfig, bandwidthLimit: parseInt(e.target.value)})} className="w-full" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-1"><Label>Jitter / Sleep</Label><span className="text-xs font-mono text-cyan-400">{(exfilConfig.jitter * 100).toFixed(0)}%</span></div>
                            <input type="range" min="0" max="1" step="0.1" value={exfilConfig.jitter} onChange={e => setExfilConfig({...exfilConfig, jitter: parseFloat(e.target.value)})} className="w-full" />
                        </div>
                    </div>
                </Card>

                {/* Physics Output */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Grid cols={3}>
                        <Card className="p-4 bg-slate-900 border-l-4 border-l-cyan-500">
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Est. Duration</div>
                            <div className="text-2xl font-mono text-white font-bold">{exfilPhysics.duration}</div>
                        </Card>
                        <Card className="p-4 bg-slate-900 border-l-4 border-l-purple-500">
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Total Payload</div>
                            <div className="text-2xl font-mono text-white font-bold">{exfilPhysics.totalSize}</div>
                            <div className="text-[10px] text-slate-400">Overhead: {exfilPhysics.overheadPct}</div>
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
                            <div>&gt; INIT_EXFIL_SEQUENCE target={exfilNodeId} proto={exfilConfig.protocol}</div>
                            <div>&gt; CHUNK_SIZE={exfilConfig.chunkSize}KB JITTER={exfilConfig.jitter}</div>
                            <div>&gt; CALCULATING_ENTROPY... {exfilConfig.encryption === 'AES' ? 'HIGH (8.2)' : 'LOW (3.5)'}</div>
                            <div className="text-yellow-500">&gt; WARNING: Overhead {exfilPhysics.overheadPct} detected due to protocol encapsulation.</div>
                            <div>&gt; EST_PACKETS: {exfilPhysics.packets}</div>
                            <div>&gt; EFFECTIVE_THROUGHPUT: {exfilPhysics.throughput}</div>
                            <div className="animate-pulse">&gt; STREAMING_DATA... [====================] 100%</div>
                            {exfilPhysics.detectionScore > 80 && <div className="text-red-500 font-bold bg-red-900/10 p-2 mt-4 border border-red-900">! ALERT: DLP HEURISTIC MATCH TRIGGERED !</div>}
                        </div>
                    </Card>
                </div>
             </div>
           )}

           {activeTab === 'BUILDER' && <CampaignBuilder />}

        </div>
      </div>
    </StandardPage>
  );
};
export default BreachSimulator;
