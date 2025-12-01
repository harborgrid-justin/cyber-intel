
import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Grid, ProgressBar, FilterGroup, CardHeader } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { ResponseLogic } from '../../services/logic/ResponseLogic';
import { DefenseLogic } from '../../services/logic/DefenseLogic';
import { StandardPage } from '../Shared/Layouts';
import { SystemNode, ResponsePlan, Honeytoken } from '../../types';
import { Icons } from '../Shared/Icons';

const Orchestrator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RESPONSE' | 'DECEPTION' | 'SEGMENT' | 'PATCH'>('RESPONSE');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<ResponsePlan | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [honeytokens, setHoneytokens] = useState<Honeytoken[]>([
     { id: 'h1', name: 'admin_creds_backup.txt', type: 'FILE', location: 'FileShare-01', status: 'ACTIVE' },
     { id: 'h2', name: 'aws_root_key', type: 'CREDENTIAL', location: 'DevOps-Workstation', status: 'DORMANT' },
     { id: 'h3', name: 'fake_payroll_db', type: 'SERVICE', location: 'DB-Cluster', status: 'TRIGGERED', lastTriggered: '10 mins ago' }
  ]);
  
  const nodes = threatData.getSystemNodes();
  const playbooks = threatData.getPlaybooks();
  const vulns = threatData.getVulnerabilities();

  const handleSelectNode = (id: string) => { setSelectedNodeId(id); setGeneratedPlan(null); };

  const handleSimulate = (pbId: string) => {
    const node = nodes.find(n => n.id === selectedNodeId);
    const pb = playbooks.find(p => p.id === pbId);
    if (!node || !pb) return;
    setIsSimulating(true);
    setTimeout(() => {
      const plan = ResponseLogic.generateResponsePlan(pb, node, nodes);
      setGeneratedPlan(plan);
      setIsSimulating(false);
    }, 1200);
  };

  const handleExecute = () => {
    if (!generatedPlan) return;
    setGeneratedPlan({ ...generatedPlan, status: 'EXECUTING' });
    setTimeout(() => {
      setGeneratedPlan({ ...generatedPlan, status: 'COMPLETED' });
      alert(`Orchestration Complete: ${generatedPlan.name}`);
    }, 2000);
  };

  const prioritizedPatches = useMemo(() => DefenseLogic.prioritizePatches(vulns, nodes), [vulns, nodes]);

  return (
    <StandardPage title="Active Defense Orchestrator" subtitle="SOAR & Defensive Operations" modules={[]} activeModule="" onModuleChange={() => {}}>
      <div className="flex flex-col lg:h-full h-auto gap-6">
        
        {/* Module Nav */}
        <div className="bg-slate-900 border-b border-slate-800 pb-0 shrink-0">
           <FilterGroup value={activeTab} onChange={(v: any) => setActiveTab(v)} options={[
              { label: 'Response Topology', value: 'RESPONSE', icon: <Icons.Network className="w-3 h-3" /> },
              { label: 'Deception Ops', value: 'DECEPTION', icon: <Icons.Target className="w-3 h-3" /> },
              { label: 'Segmentation', value: 'SEGMENT', icon: <Icons.Grid className="w-3 h-3" /> },
              { label: 'Patch Strategy', value: 'PATCH', icon: <Icons.Refresh className="w-3 h-3" /> }
           ]} />
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 min-h-0 lg:overflow-hidden">
           
           {/* VIEW 1: RESPONSE TOPOLOGY */}
           {activeTab === 'RESPONSE' && (
             <div className="flex flex-col lg:flex-row gap-6 lg:h-full h-auto pb-6 lg:pb-0">
                <Card className="flex-1 bg-slate-950 border-slate-800 relative overflow-hidden flex flex-col min-h-[450px] p-0">
                   <CardHeader 
                     title="Live Blast Radius"
                     action={
                       <div className="flex gap-2 text-[10px] text-slate-400">
                         <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Online</span>
                         <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>Compromised</span>
                       </div>
                     }
                   />
                   <div className="flex-1 relative flex items-center justify-center overflow-auto custom-scrollbar">
                      <div className="grid grid-cols-3 gap-4 md:gap-8 p-8 md:p-12 relative z-10">
                         {nodes.map(node => {
                            const isSelected = node.id === selectedNodeId;
                            const isTarget = generatedPlan?.targetNodes.includes(node.id);
                            const isImpacted = generatedPlan?.businessImpact.some(i => i.includes(node.name));
                            return (
                              <div key={node.id} onClick={() => handleSelectNode(node.id)} className={`w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-300 relative bg-slate-900 ${isSelected ? 'border-blue-500 bg-blue-900/20 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-20' : node.status === 'DEGRADED' ? 'border-red-500 bg-red-900/10' : 'border-slate-700 hover:border-slate-500'} ${isImpacted ? 'animate-pulse border-orange-500' : ''}`}>
                                 <div className={`mb-1 ${node.type === 'Database' ? 'text-purple-400' : 'text-slate-300'}`}>
                                    {node.type === 'Database' ? <Icons.Database className="w-5 h-5 md:w-6 md:h-6" /> : node.type === 'Firewall' ? <Icons.Shield className="w-5 h-5 md:w-6 md:h-6" /> : <Icons.Monitor className="w-5 h-5 md:w-6 md:h-6" />}
                                 </div>
                                 <div className="text-[9px] md:text-[10px] font-bold text-center leading-tight text-slate-200 truncate w-full px-1">{node.name}</div>
                                 {isTarget && <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">TARGET</div>}
                                 {isImpacted && <div className="absolute -bottom-2 bg-orange-500 text-white text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">RISK</div>}
                              </div>
                            );
                         })}
                      </div>
                      <svg className="absolute inset-0 pointer-events-none opacity-20 min-h-full min-w-full"><line x1="30%" y1="30%" x2="50%" y2="50%" stroke="white" strokeWidth="1" /><line x1="70%" y1="30%" x2="50%" y2="50%" stroke="white" strokeWidth="1" /><line x1="50%" y1="70%" x2="50%" y2="50%" stroke="white" strokeWidth="1" /></svg>
                   </div>
                </Card>
                <div className="lg:w-96 flex flex-col gap-6 shrink-0 h-fit lg:h-full">
                   {selectedNodeId ? (
                     <Card className="flex flex-col lg:h-full p-0 overflow-hidden">
                        <CardHeader 
                          title="Response Controls" 
                          className="shrink-0"
                        />
                        <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                           <p className="text-xs text-slate-500">Target: <span className="text-cyan-400 font-mono font-bold">{nodes.find(n => n.id === selectedNodeId)?.name}</span></p>
                        </div>
                        <div className="p-4 space-y-4 flex-1 lg:overflow-y-auto custom-scrollbar">
                           {!generatedPlan ? (
                              <div className="space-y-2">{playbooks.slice(0,3).map(pb => (<button key={pb.id} onClick={() => handleSimulate(pb.id)} className="w-full text-left p-3 rounded border border-slate-700 bg-slate-900 hover:border-cyan-500 hover:bg-slate-800 transition-all group"><div className="flex justify-between items-center mb-1"><span className="font-bold text-slate-200 text-xs group-hover:text-white">{pb.name}</span><Badge color={pb.riskLevel === 'HIGH' ? 'red' : 'blue'}>{pb.riskLevel || 'LOW'} RISK</Badge></div><div className="text-[10px] text-slate-500 truncate">{pb.description}</div></button>))}</div>
                           ) : (
                              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                 <div className="bg-slate-900 border border-slate-800 p-3 rounded"><div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-400 uppercase">Collateral Damage</span><span className={`text-lg font-bold font-mono ${generatedPlan.collateralDamageScore > 50 ? 'text-red-500' : 'text-green-500'}`}>{generatedPlan.collateralDamageScore}/100</span></div><ProgressBar value={generatedPlan.collateralDamageScore} color={generatedPlan.collateralDamageScore > 50 ? 'red' : 'green'} /></div>
                                 <div><span className="text-xs font-bold text-slate-500 uppercase block mb-2">Projected Impact</span><ul className="space-y-2">{generatedPlan.businessImpact.map((imp, i) => (<li key={i} className="text-[10px] bg-orange-900/10 border-l-2 border-orange-500 pl-2 py-1 text-slate-300">{imp}</li>))}</ul></div>
                                 <div className="pt-4 flex gap-2"><Button onClick={handleExecute} variant="primary" className="flex-1" disabled={generatedPlan.status !== 'DRAFT'}>{generatedPlan.status === 'EXECUTING' ? 'DEPLOYING...' : generatedPlan.status === 'COMPLETED' ? 'DEPLOYED' : 'EXECUTE PLAN'}</Button><Button onClick={() => setGeneratedPlan(null)} variant="secondary">RESET</Button></div>
                              </div>
                           )}
                        </div>
                     </Card>
                   ) : <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-slate-600 font-bold uppercase tracking-widest text-xs p-8 text-center min-h-[200px]">Select a node to initiate response</div>}
                </div>
             </div>
           )}

           {/* VIEW 2: DECEPTION OPS */}
           {activeTab === 'DECEPTION' && (
             <div className="lg:h-full grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 lg:pb-0">
                <Card className="p-0 overflow-hidden flex flex-col max-h-[500px] lg:max-h-full">
                   <CardHeader title="Active Honeytokens" />
                   <div className="divide-y divide-slate-800 overflow-y-auto flex-1 custom-scrollbar">
                      {honeytokens.map(h => (
                         <div key={h.id} className="p-4 flex items-center justify-between hover:bg-slate-900/50">
                            <div>
                               <div className="font-bold text-white flex items-center gap-2">
                                  {h.status === 'TRIGGERED' && <span className="animate-ping w-2 h-2 bg-red-500 rounded-full"></span>}
                                  {h.name}
                               </div>
                               <div className="text-xs text-slate-500">{h.type} on {h.location}</div>
                            </div>
                            <div className="text-right">
                               <Badge color={h.status === 'ACTIVE' ? 'green' : h.status === 'TRIGGERED' ? 'red' : 'slate'}>{h.status}</Badge>
                               {h.lastTriggered && <div className="text-[10px] text-red-400 mt-1 font-bold">HIT: {h.lastTriggered}</div>}
                            </div>
                         </div>
                      ))}
                   </div>
                </Card>
                <div className="flex flex-col gap-4 h-fit">
                   <Card className="p-6 bg-slate-900/50 border-dashed border-2 flex items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-slate-900 transition-all">
                      <div className="text-center flex flex-col items-center">
                         <Icons.Target className="w-10 h-10 text-slate-600 mb-2" />
                         <div className="font-bold text-white">Deploy New Canary</div>
                         <div className="text-xs text-slate-500">Files, Database Rows, AWS Keys</div>
                      </div>
                   </Card>
                   <Card className="p-0 overflow-hidden">
                      <CardHeader title="Honeytoken Effectiveness" />
                      <div className="p-6 space-y-4">
                         <div><div className="flex justify-between text-xs text-slate-400 mb-1"><span>Trigger Rate</span><span>12%</span></div><ProgressBar value={12} /></div>
                         <div><div className="flex justify-between text-xs text-slate-400 mb-1"><span>False Positives</span><span>0.5%</span></div><ProgressBar value={1} color="green" /></div>
                      </div>
                   </Card>
                </div>
             </div>
           )}

           {/* VIEW 3: SEGMENTATION */}
           {activeTab === 'SEGMENT' && (
             <div className="lg:h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-xl min-h-[300px]">
                <div className="text-center">
                   <h3 className="text-xl font-bold text-white mb-2">Micro-Segmentation Planner</h3>
                   <p className="text-slate-400 max-w-md mx-auto mb-6">Visualizer allows testing firewall policies against simulated traffic before deployment.</p>
                   <Button variant="secondary">LAUNCH POLICY SIMULATOR</Button>
                </div>
             </div>
           )}

           {/* VIEW 4: PATCH STRATEGY */}
           {activeTab === 'PATCH' && (
             <Card className="lg:h-full h-[500px] p-0 overflow-hidden flex flex-col">
                <CardHeader 
                  title="Risk-Based Prioritization"
                  action={<Badge color="red">{prioritizedPatches.length} Critical Actions</Badge>}
                />
                <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
                   {prioritizedPatches.map((p, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded hover:border-cyan-500 transition-colors">
                         <div className="text-2xl font-bold text-slate-700">{i + 1}</div>
                         <div className="flex-1 min-w-0">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1">
                               <span className="font-bold text-white truncate pr-2">{p.vulnId}</span>
                               <span className="text-[10px] text-slate-500 uppercase">Asset: {p.assetId}</span>
                            </div>
                            <div className="text-xs text-slate-400 truncate">{p.reason}</div>
                         </div>
                         <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge color={p.businessCriticality === 'CRITICAL' ? 'red' : p.businessCriticality === 'HIGH' ? 'orange' : 'yellow'}>{p.businessCriticality} IMPACT</Badge>
                            <span className="text-[10px] font-bold text-slate-500">Risk Score: {p.score}</span>
                         </div>
                         <Button variant="primary" className="text-[10px] py-1 h-8 shrink-0">PATCH</Button>
                      </div>
                   ))}
                </div>
             </Card>
           )}

        </div>
      </div>
    </StandardPage>
  );
};
export default Orchestrator;
