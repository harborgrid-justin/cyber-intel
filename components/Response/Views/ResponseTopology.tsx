
import React from 'react';
import { Card, CardHeader, Badge, Button, ProgressBar } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { SystemNode, ResponsePlan, Playbook, Threat } from '../../../types';
import { TopologyNode } from './TopologyNode';

interface Props {
  nodes: SystemNode[];
  activeThreats: Threat[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  generatedPlan: ResponsePlan | null;
  playbooks: Playbook[];
  onSimulate: (pbId: string) => void;
  onExecute: () => void;
  onReset: () => void;
}

export const ResponseTopology: React.FC<Props> = ({ nodes, activeThreats, selectedNodeId, onSelectNode, generatedPlan, playbooks, onSimulate, onExecute, onReset }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-full h-auto pb-6 lg:pb-0">
        <Card className="flex-1 bg-slate-950 border-slate-800 relative overflow-hidden flex flex-col min-h-[450px] p-0">
            <CardHeader 
                title="Live Blast Radius & Threat Context"
                action={
                <div className="flex gap-2 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Online</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>Active Incident</span>
                </div>
                }
            />
            <div className="flex-1 relative flex items-center justify-center overflow-auto custom-scrollbar">
                <div className="grid grid-cols-3 gap-4 md:gap-8 p-8 md:p-12 relative z-10">
                    {nodes.map(node => (
                        <TopologyNode 
                            key={node.id} 
                            node={node}
                            isSelected={node.id === selectedNodeId}
                            isTarget={generatedPlan?.targetNodes.includes(node.id) || false}
                            isImpacted={generatedPlan?.businessImpact.some(i => i.includes(node.name)) || false}
                            isUnderAttack={activeThreats.some(t => t.source.includes(node.name) || t.description.includes(node.name))}
                            onSelect={onSelectNode}
                        />
                    ))}
                </div>
                {/* Visual Wiring */}
                <svg className="absolute inset-0 pointer-events-none opacity-20 min-h-full min-w-full">
                    <line x1="30%" y1="30%" x2="50%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="70%" y1="30%" x2="50%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="50%" y1="70%" x2="50%" y2="50%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
                </svg>
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
                    <p className="text-xs text-slate-500">Target Asset: <span className="text-cyan-400 font-mono font-bold block mt-1 text-sm">{nodes.find(n => n.id === selectedNodeId)?.name}</span></p>
                    
                    {activeThreats.filter(t => t.source.includes(nodes.find(n => n.id === selectedNodeId)?.name || '')).length > 0 && (
                        <div className="mt-2 space-y-1">
                            {activeThreats.filter(t => t.source.includes(nodes.find(n => n.id === selectedNodeId)?.name || '')).map(t => (
                                <div key={t.id} className="text-[9px] bg-red-900/20 text-red-300 p-1 rounded border border-red-900/50 flex gap-2 items-center">
                                    <Icons.AlertTriangle className="w-3 h-3" /> {t.indicator}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 space-y-4 flex-1 lg:overflow-y-auto custom-scrollbar">
                    {!generatedPlan ? (
                        <div className="space-y-2">
                            <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Available Playbooks</div>
                            {playbooks.slice(0,4).map(pb => (
                                <button key={pb.id} onClick={() => onSimulate(pb.id)} className="w-full text-left p-3 rounded border border-slate-700 bg-slate-900 hover:border-cyan-500 hover:bg-slate-800 transition-all group">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-200 text-xs group-hover:text-white">{pb.name}</span>
                                        <Badge color={pb.riskLevel === 'HIGH' ? 'red' : 'blue'}>{pb.riskLevel || 'LOW'} RISK</Badge>
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">{pb.description}</div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Collateral Damage</span>
                                    <span className={`text-lg font-bold font-mono ${generatedPlan.collateralDamageScore > 50 ? 'text-red-500' : 'text-green-500'}`}>{generatedPlan.collateralDamageScore.toFixed(0)}/100</span>
                                </div>
                                <ProgressBar value={generatedPlan.collateralDamageScore} color={generatedPlan.collateralDamageScore > 50 ? 'red' : 'green'} />
                            </div>
                            
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase block mb-2">Projected Business Impact</span>
                                <ul className="space-y-2">
                                    {generatedPlan.businessImpact.map((imp, i) => (
                                        <li key={i} className="text-[10px] bg-orange-900/10 border-l-2 border-orange-500 pl-2 py-1 text-slate-300 flex items-start gap-2">
                                            <span className="mt-0.5">•</span> {imp}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {generatedPlan.requiredAuth && (
                                <div className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded border border-slate-800">
                                    <span className="text-slate-500">Authorization:</span>
                                    <Badge color={generatedPlan.requiredAuth === 'Authorized' ? 'green' : 'red'}>{generatedPlan.requiredAuth}</Badge>
                                </div>
                            )}

                            <div className="pt-4 flex gap-2">
                                <Button onClick={onExecute} variant="primary" className="flex-1" disabled={generatedPlan.status !== 'DRAFT'}>
                                    {generatedPlan.status === 'EXECUTING' ? 'DEPLOYING...' : generatedPlan.status === 'COMPLETED' ? 'DEPLOYED' : 'EXECUTE PLAN'}
                                </Button>
                                <Button onClick={onReset} variant="secondary">RESET</Button>
                            </div>
                        </div>
                    )}
                </div>
                </Card>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-slate-600 p-8 text-center min-h-[200px] bg-slate-900/20">
                    <Icons.Target className="w-12 h-12 mb-4 opacity-20" />
                    <div className="font-bold uppercase tracking-widest text-xs">Select a node to initiate response</div>
                </div>
            )}
        </div>
    </div>
  );
};
