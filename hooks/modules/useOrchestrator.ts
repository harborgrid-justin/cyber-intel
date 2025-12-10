
import { useState, useCallback, useMemo } from 'react';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../useDataStore';
import { ResponseLogic } from '../../services/logic/ResponseLogic';
import { OrchestratorLogic } from '../../services/logic/OrchestratorLogic';
import { ResponsePlan, PatchPrioritization } from '../../types';
import { useIsMounted } from '../useIsMounted';

export const useOrchestrator = () => {
  const [activeTab, setActiveTab] = useState('Response Topology');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<ResponsePlan | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const isMounted = useIsMounted();

  // Efficient Subscriptions
  const nodes = useDataStore(() => threatData.getSystemNodes());
  const playbooks = useDataStore(() => threatData.getPlaybooks());
  const vulns = useDataStore(() => threatData.getVulnerabilities());
  const threats = useDataStore(() => threatData.getThreats());
  const honeytokens = useDataStore(() => threatData.getHoneytokens());

  const handleSimulate = useCallback(async (pbId: string) => {
    const node = nodes.find(n => n.id === selectedNodeId);
    const pb = playbooks.find(p => p.id === pbId);
    
    if (!node || !pb) return;
    
    setIsSimulating(true);
    
    try {
        // Call backend via wrapper
        const plan = await ResponseLogic.generateResponsePlan(pb, node);
        
        if (isMounted()) {
            setGeneratedPlan(plan);
        }
    } catch (error) {
        console.error("Simulation failed", error);
        if (isMounted()) {
            alert("Simulation failed. Check console for details.");
        }
    } finally {
        if (isMounted()) {
            setIsSimulating(false);
        }
    }
  }, [nodes, playbooks, selectedNodeId, isMounted]);

  const handleExecute = useCallback(() => {
    if (!generatedPlan) return;
    
    if (generatedPlan.requiredAuth === 'ELEVATION_REQUIRED') {
        alert("EXECUTION BLOCKED: Insufficient Clearance for this blast radius.");
        return;
    }
    
    setGeneratedPlan(prev => prev ? ({ ...prev, status: 'EXECUTING' }) : null);
    
    // Simulate async execution
    setTimeout(() => {
      if (isMounted()) {
        setGeneratedPlan(prev => prev ? ({ ...prev, status: 'COMPLETED' }) : null);
        
        if (generatedPlan.type === 'ISOLATION') {
            generatedPlan.targetNodes.forEach(nid => {
                try {
                    threatData.nodeStore.isolateNode(nid);
                } catch (e) {
                    console.error("Failed to isolate node", nid, e);
                }
            });
        }
        alert(`Orchestration Complete: ${generatedPlan.name}`);
      }
    }, 2000);
  }, [generatedPlan, isMounted]);

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
          } as PatchPrioritization;
      }).filter((p): p is PatchPrioritization => p !== null);
  }, [vulns, nodes]);

  return {
    activeTab,
    setActiveTab,
    selectedNodeId,
    setSelectedNodeId,
    generatedPlan,
    setGeneratedPlan,
    isSimulating,
    handleSimulate,
    handleExecute,
    prioritizedPatches,
    nodes,
    playbooks,
    threats,
    honeytokens
  };
};
