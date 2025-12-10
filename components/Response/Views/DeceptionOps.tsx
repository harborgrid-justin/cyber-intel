
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Badge, ProgressBar, Button, Input, Select, Label } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { Honeytoken } from '../../../types';
import { OrchestratorLogic } from '../../../services/logic/OrchestratorLogic';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks';

interface Props {
  honeytokens: Honeytoken[];
}

export const DeceptionOps: React.FC<Props> = ({ honeytokens }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [newDecoy, setNewDecoy] = useState({ name: '', type: 'FILE', location: '' });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [effectiveness, setEffectiveness] = useState(0);
  const allNodes = useDataStore(() => threatData.getSystemNodes());
  
  useEffect(() => {
    OrchestratorLogic.recommendDecoyPlacement().then(setRecommendations);
    OrchestratorLogic.analyzeLureEffectiveness(honeytokens).then(setEffectiveness);
  }, [honeytokens]);

  const handleDeploy = () => {
      if(!newDecoy.name || !newDecoy.location) return;
      alert(`Deploying ${newDecoy.type} decoy '${newDecoy.name}' to ${newDecoy.location}...`);
      setIsDeploying(false);
      setNewDecoy({ name: '', type: 'FILE', location: '' });
  };

  const handleAutoDeploy = (rec: {nodeId: string, reason: string}) => {
      const node = allNodes.find(n => n.id === rec.nodeId);
      if(node) {
          setNewDecoy({ name: `honeypot_${node.name.toLowerCase()}.dat`, type: 'FILE', location: node.name });
          setIsDeploying(true);
      }
  };

  return (
    <div className="lg:h-full grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 lg:pb-0">
        <Card className="p-0 overflow-hidden flex flex-col max-h-[500px] lg:max-h-full">
            <CardHeader title="Active Honeytokens" action={<Badge color="blue">{honeytokens.length} Active</Badge>} />
            <div className="divide-y divide-slate-800 overflow-y-auto flex-1 custom-scrollbar">
                {honeytokens.map(h => (
                    <div key={h.id} className="p-4 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                        <div>
                            <div className="font-bold text-white flex items-center gap-2">
                                {h.status === 'TRIGGERED' && <span className="animate-ping w-2 h-2 bg-red-500 rounded-full"></span>}
                                {h.name}
                            </div>
                            <div className="text-xs text-slate-500 flex gap-2 mt-1">
                                <Badge color="slate">{h.type}</Badge> on {h.location}
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge color={h.status === 'ACTIVE' ? 'green' : h.status === 'TRIGGERED' ? 'red' : 'slate'}>{h.status}</Badge>
                            {h.lastTriggered && <div className="text-[9px] text-red-400 mt-1 font-bold">HIT: {h.lastTriggered}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </Card>

        <div className="flex flex-col gap-6 h-fit">
            <Card className="p-6 bg-slate-900/50 border-slate-800">
                {isDeploying ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <h3 className="font-bold text-white">Configure New Decoy</h3>
                        <div>
                            <Label>Decoy Type</Label>
                            <Select value={newDecoy.type} onChange={e => setNewDecoy({...newDecoy, type: e.target.value})}>
                                <option value="FILE">File / Document</option>
                                <option value="CREDENTIAL">Fake Credential</option>
                                <option value="SERVICE">Service Listener</option>
                            </Select>
                        </div>
                        <div>
                            <Label>Name</Label>
                            <Input value={newDecoy.name} onChange={e => setNewDecoy({...newDecoy, name: e.target.value})} placeholder="e.g. passwords.txt" />
                        </div>
                        <div>
                            <Label>Location (Node)</Label>
                            <Input value={newDecoy.location} onChange={e => setNewDecoy({...newDecoy, location: e.target.value})} placeholder="e.g. Server-01" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleDeploy} variant="primary" className="flex-1">DEPLOY</Button>
                            <Button onClick={() => setIsDeploying(false)} variant="secondary" className="flex-1">CANCEL</Button>
                        </div>
                    </div>
                ) : (
                    <div 
                        onClick={() => setIsDeploying(true)}
                        className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-slate-900 transition-all group"
                    >
                        <Icons.Target className="w-12 h-12 text-slate-600 mb-2 group-hover:text-cyan-500 transition-colors" />
                        <div className="font-bold text-white group-hover:text-cyan-400">Deploy New Decoy</div>
                        <div className="text-xs text-slate-500 mt-1">Files, Credentials, or Services</div>
                    </div>
                )}
            </Card>

            <Card className="p-0 overflow-hidden">
                <CardHeader title="Effectiveness Analysis" />
                <div className="p-6 space-y-6">
                    <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-2"><span>Signal-to-Noise Ratio</span><span className="text-white font-bold">{effectiveness}%</span></div>
                        <ProgressBar value={effectiveness} color={effectiveness > 80 ? 'green' : 'orange'} />
                        <div className="text-[10px] text-slate-500 mt-1">{effectiveness > 80 ? 'High Fidelity' : 'Optimization Needed'}</div>
                    </div>
                    
                    <div className="border-t border-slate-800 pt-4">
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-3">AI Recommendations</div>
                        <div className="space-y-2">
                            {recommendations.slice(0, 3).map(rec => {
                                const nodeName = allNodes.find(n => n.id === rec.nodeId)?.name;
                                return (
                                    <div key={rec.nodeId} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                                        <div className="text-xs">
                                            <div className="text-cyan-400 font-bold">{nodeName}</div>
                                            <div className="text-[9px] text-slate-500">{rec.reason}</div>
                                        </div>
                                        <Button onClick={() => handleAutoDeploy(rec)} variant="secondary" className="text-[9px] h-6 px-2">AUTO-DEPLOY</Button>
                                    </div>
                                );
                            })}
                            {recommendations.length === 0 && <div className="text-xs text-slate-500 italic text-center">Coverage optimal.</div>}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
};
