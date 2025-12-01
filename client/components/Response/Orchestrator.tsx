
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '../Shared/UI';
import { threatData } from '../services-frontend/dataLayer';
import { ResponseLogic } from '../services-frontend/logic/ResponseLogic';
import { OrchestratorLogic } from '../services-frontend/logic/OrchestratorLogic';
import { StandardPage } from '../Shared/Layouts';
import { ResponsePlan, Honeytoken } from '../../types';
import { ResponseTopology } from './Views/ResponseTopology';
import { DeceptionOps } from './Views/DeceptionOps';
import { PatchStrategy } from './Views/PatchStrategy';
import { SegmentationView } from './Views/SegmentationView';
import { CONFIG } from '../../config';

const Orchestrator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Response Topology');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<ResponsePlan | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  
  const [honeytokens, setHoneytokens] = useState<Honeytoken[]>([
     { id: 'h1', name: 'admin_creds_backup.txt', type: 'FILE', location: 'FileShare-01', status: 'ACTIVE', effectiveness: 85 },
     { id: 'h2', name: 'aws_root_key', type: 'CREDENTIAL', location: 'DevOps-Workstation', status: 'DORMANT', effectiveness: 40 },
     { id: 'h3', name: 'fake_payroll_db', type: 'SERVICE', location: 'DB-Cluster', status: 'TRIGGERED', lastTriggered: '10 mins ago', effectiveness: 95 }
  ]);
  
  const nodes = threatData.getSystemNodes();
  const playbooks = threatData.getPlaybooks();
  const vulns = threatData.getVulnerabilities();
  const threats = threatData.getThreats();

  useEffect(() => {
      const handleUpdate = () => setRefreshTrigger(prev => prev + 1);
      window.addEventListener('data-update', handleUpdate);
      return () => window.removeEventListener('data-update', handleUpdate);
  }, []);

  const handleSimulate = (pbId: string) => {
    const node = nodes.find(n => n.id === selectedNodeId);
    const pb = playbooks.find(p => p.id === pbId);
    if (!node || !pb) return;
    
    setIsSimulating(true);
    setTimeout(() => {
      const basicPlan = ResponseLogic.generateResponsePlan(pb, node, nodes);
      const blastRadius = OrchestratorLogic.calculateBlastRadius(node.id, nodes);
      const authorized = OrchestratorLogic.validateResponseAuthority(basicPlan, CONFIG.USER.CLEARANCE);
      const ttr = OrchestratorLogic.estimateTimeToRecovery(node);

      setGeneratedPlan({
        ...basicPlan,
        collateralDamageScore: blastRadius.riskScore,
        businessImpact: [
            ...basicPlan.businessImpact, 
            `Affected Downstream Nodes: ${blastRadius.affectedNodes.length - 1}`, 
            `Est. Recovery Time: ${ttr}`
        ],
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
      if (generatedPlan.type === 'ISOLATION') {
          generatedPlan.targetNodes.forEach(nid => threatData.nodeStore.isolateNode(nid));
      }
      alert(`Orchestration Complete: ${generatedPlan.name}`);
    }, 2000);
  };

  const prioritizedPatches = useMemo(() => {
      return vulns.map(v => {
          const node = nodes.find(n => n.vulnerabilities?.includes(v.id));
          if (!node || v.status === 'PATCHED') return null; 
          
          const riskScore = OrchestratorLogic.calculateContextualPatchRisk(v, node);
          const window = OrchestratorLogic.determinePatchWindow(node);
          
          return {
              vulnId: v.id,
              assetId: node.id,
              score: riskScore,
              reason: `Window: ${window}${v.exploited ? ' | KEV' : ''}`,
              cvss: v.score,
              businessCriticality: riskScore > 80 ? 'CRITICAL' : riskScore > 50 ? 'HIGH' : 'MEDIUM'
          };
      }).filter(Boolean) as any[];
  }, [vulns, nodes, refreshTrigger]);

  const MODULES = ['Response Topology', 'Deception Ops', 'Segmentation', 'Patch Strategy'];

  return (
    <StandardPage 
        title="Active Defense Orchestrator" 
        subtitle="SOAR & Defensive Operations" 
        modules={MODULES} 
        activeModule={activeTab} 
        onModuleChange={setActiveTab}
    >
        <div className="flex-1 min-h-0 lg:overflow-hidden">
           {activeTab === 'Response Topology' && (
             <ResponseTopology 
                nodes={nodes}
                activeThreats={threats.filter(t => t.status !== 'CLOSED')}
                selectedNodeId={selectedNodeId} 
                onSelectNode={(id) => { setSelectedNodeId(id); setGeneratedPlan(null); }}
                generatedPlan={generatedPlan}
                playbooks={playbooks}
                onSimulate={handleSimulate}
                onExecute={handleExecute}
                onReset={() => setGeneratedPlan(null)}
             />
           )}

           {activeTab === 'Deception Ops' && <DeceptionOps honeytokens={honeytokens} />}

           {activeTab === 'Segmentation' && <SegmentationView />}

           {activeTab === 'Patch Strategy' && <PatchStrategy prioritizedPatches={prioritizedPatches} />}
        </div>
    </StandardPage>
  );
};
export default Orchestrator;
