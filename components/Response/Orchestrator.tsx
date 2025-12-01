
import React, { useState, useMemo } from 'react';
import { Button, FilterGroup } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { ResponseLogic } from '../../services/logic/ResponseLogic';
import { DefenseLogic } from '../../services/logic/DefenseLogic';
import { OrchestratorLogic } from '../../services/logic/OrchestratorLogic';
import { StandardPage } from '../Shared/Layouts';
import { ResponsePlan, Honeytoken } from '../../types';
import { Icons } from '../Shared/Icons';
import { ResponseTopology } from './Views/ResponseTopology';
import { DeceptionOps } from './Views/DeceptionOps';
import { PatchStrategy } from './Views/PatchStrategy';
import { SegmentationView } from './Views/SegmentationView';
import { CONFIG } from '../../config';

const Orchestrator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RESPONSE' | 'DECEPTION' | 'SEGMENT' | 'PATCH'>('RESPONSE');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<ResponsePlan | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [honeytokens, setHoneytokens] = useState<Honeytoken[]>([
     { id: 'h1', name: 'admin_creds_backup.txt', type: 'FILE', location: 'FileShare-01', status: 'ACTIVE', effectiveness: 85 },
     { id: 'h2', name: 'aws_root_key', type: 'CREDENTIAL', location: 'DevOps-Workstation', status: 'DORMANT', effectiveness: 40 },
     { id: 'h3', name: 'fake_payroll_db', type: 'SERVICE', location: 'DB-Cluster', status: 'TRIGGERED', lastTriggered: '10 mins ago', effectiveness: 95 }
  ]);
  
  const nodes = threatData.getSystemNodes();
  const playbooks = threatData.getPlaybooks();
  const vulns = threatData.getVulnerabilities();

  // --- Logic Integration ---

  // 1. Response Topology Logic
  const handleSimulate = (pbId: string) => {
    const node = nodes.find(n => n.id === selectedNodeId);
    const pb = playbooks.find(p => p.id === pbId);
    if (!node || !pb) return;
    
    setIsSimulating(true);
    setTimeout(() => {
      // Use basic logic for plan generation
      const basicPlan = ResponseLogic.generateResponsePlan(pb, node, nodes);
      
      // Enhance with Advanced Orchestrator Logic
      const blastRadius = OrchestratorLogic.calculateBlastRadius(node.id, nodes);
      const authorized = OrchestratorLogic.validateResponseAuthority(basicPlan, CONFIG.USER.CLEARANCE);
      const ttr = OrchestratorLogic.estimateTimeToRecovery(node);

      setGeneratedPlan({
        ...basicPlan,
        collateralDamageScore: blastRadius.riskScore,
        businessImpact: [...basicPlan.businessImpact, `Affected Nodes: ${blastRadius.affectedNodes.length}`, `Est. Recovery: ${ttr}`],
        requiredAuth: authorized ? 'Authorized' : 'ELEVATION_REQUIRED'
      });
      
      setIsSimulating(false);
    }, 1000);
  };

  const handleExecute = () => {
    if (!generatedPlan) return;
    if (generatedPlan.requiredAuth === 'ELEVATION_REQUIRED') {
        alert("EXECUTION BLOCKED: Insufficient Clearance for this blast radius.");
        return;
    }
    setGeneratedPlan({ ...generatedPlan, status: 'EXECUTING' });
    setTimeout(() => {
      setGeneratedPlan({ ...generatedPlan, status: 'COMPLETED' });
      alert(`Orchestration Complete: ${generatedPlan.name}`);
    }, 2000);
  };

  // 2. Patch Strategy Logic (Advanced Context)
  const prioritizedPatches = useMemo(() => {
      // Use the advanced contextual scoring from OrchestratorLogic
      return vulns.map(v => {
          const node = nodes.find(n => n.vulnerabilities?.includes(v.id));
          if (!node) return null;
          
          const riskScore = OrchestratorLogic.calculateContextualPatchRisk(v, node);
          const window = OrchestratorLogic.determinePatchWindow(node);
          
          return {
              vulnId: v.id,
              assetId: node.id,
              score: riskScore,
              reason: `Window: ${window}`,
              cvss: v.score,
              businessCriticality: riskScore > 80 ? 'CRITICAL' : riskScore > 50 ? 'HIGH' : 'MEDIUM'
          };
      }).filter(Boolean) as any[];
  }, [vulns, nodes]);

  // 3. Deception Logic (Recommendations)
  // This would typically trigger a "Recommended Decoys" modal, simulated here by updating state if empty
  useMemo(() => {
      if (activeTab === 'DECEPTION' && honeytokens.length < 5) {
          const recs = OrchestratorLogic.recommendDecoyPlacement(nodes);
          // In a real app, we'd show these as suggestions.
          console.log("Decoy Recommendations:", recs);
      }
  }, [activeTab, nodes, honeytokens.length]);

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

           {activeTab === 'SEGMENT' && <SegmentationView />}

           {activeTab === 'PATCH' && <PatchStrategy prioritizedPatches={prioritizedPatches} />}
        </div>
      </div>
    </StandardPage>
  );
};
export default Orchestrator;
