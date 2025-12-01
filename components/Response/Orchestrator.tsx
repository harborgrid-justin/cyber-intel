
import React, { useState, useMemo } from 'react';
import { Button, FilterGroup } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { ResponseLogic } from '../../services/logic/ResponseLogic';
import { DefenseLogic } from '../../services/logic/DefenseLogic';
import { StandardPage } from '../Shared/Layouts';
import { ResponsePlan, Honeytoken } from '../../types';
import { Icons } from '../Shared/Icons';
import { ResponseTopology } from './Views/ResponseTopology';
import { DeceptionOps } from './Views/DeceptionOps';
import { PatchStrategy } from './Views/PatchStrategy';

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
        <div className="bg-slate-900 border-b border-slate-800 pb-0 shrink-0">
           <FilterGroup value={activeTab} onChange={(v: any) => setActiveTab(v)} options={[
              { label: 'Response Topology', value: 'RESPONSE', icon: <Icons.Network className="w-3 h-3" /> },
              { label: 'Deception Ops', value: 'DECEPTION', icon: <Icons.Target className="w-3 h-3" /> },
              { label: 'Segmentation', value: 'SEGMENT', icon: <Icons.Grid className="w-3 h-3" /> },
              { label: 'Patch Strategy', value: 'PATCH', icon: <Icons.Refresh className="w-3 h-3" /> }
           ]} />
        </div>

        <div className="flex-1 min-h-0 lg:overflow-hidden">
           {activeTab === 'RESPONSE' && (
             <ResponseTopology 
                nodes={nodes} 
                selectedNodeId={selectedNodeId} 
                onSelectNode={(id) => { setSelectedNodeId(id); setGeneratedPlan(null); }}
                generatedPlan={generatedPlan}
                playbooks={playbooks}
                onSimulate={handleSimulate}
                onExecute={handleExecute}
                onReset={() => setGeneratedPlan(null)}
             />
           )}

           {activeTab === 'DECEPTION' && <DeceptionOps honeytokens={honeytokens} />}

           {activeTab === 'SEGMENT' && (
             <div className="lg:h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-xl min-h-[300px]">
                <div className="text-center">
                   <h3 className="text-xl font-bold text-white mb-2">Micro-Segmentation Planner</h3>
                   <p className="text-slate-400 max-w-md mx-auto mb-6">Visualizer allows testing firewall policies against simulated traffic before deployment.</p>
                   <Button variant="secondary">LAUNCH POLICY SIMULATOR</Button>
                </div>
             </div>
           )}

           {activeTab === 'PATCH' && <PatchStrategy prioritizedPatches={prioritizedPatches} />}
        </div>
      </div>
    </StandardPage>
  );
};
export default Orchestrator;
