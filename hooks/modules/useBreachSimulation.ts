
import { useState, useCallback, useRef, useEffect } from 'react';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../useDataStore';
import { SimPathLogic } from '../../services/logic/SimPathLogic';
import { SimEvasionLogic, EvasionBreakdown } from '../../services/logic/SimEvasionLogic';
import { SimExfilLogic, ExfilConfig, ExfilPhysicsResult } from '../../services/logic/SimExfilLogic';
import { SimulationPath, ThreatActor, SystemNode } from '../../types';
import { useIsMounted } from '../useIsMounted';

interface SimulationResults {
  paths: SimulationPath[];
  chokePoints: Map<string, number>;
  evasionBreakdown: { node: string; score: number; details: EvasionBreakdown[] }[];
}

export const useBreachSimulation = () => {
  const isMounted = useIsMounted();
  const [activeTab, setActiveTab] = useState<'PATH' | 'EVASION' | 'EXFIL' | 'BUILDER'>('PATH');
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Data Subscriptions
  const actors = useDataStore(() => threatData.getActors());
  const nodes = useDataStore(() => threatData.getSystemNodes());

  // Exfil State
  const [exfilConfig, setExfilConfig] = useState<ExfilConfig>({
    protocol: 'HTTPS', encryption: 'AES', chunkSize: 64, jitter: 0.1, bandwidthLimit: 100
  });
  const [exfilPhysics, setExfilPhysics] = useState<ExfilPhysicsResult | null>(null);

  // Simulation Logic
  const runSimulation = useCallback(async (actorId: string) => {
    if (!actorId) { setError("Actor ID required"); return; }
    
    setIsSimulating(true);
    setError(null);
    setResults(null);

    const target = nodes.find(n => n.type === 'Database') || nodes[0];
    const entry = nodes.find(n => n.type === 'Workstation') || nodes[nodes.length - 1];
    const actor = actors.find(a => a.id === actorId);

    if (!target || !entry || !actor) {
        setError("Invalid simulation topology configuration.");
        setIsSimulating(false);
        return;
    }

    try {
      const paths = await SimPathLogic.findAttackPaths(entry.id, target.id, nodes, actor);
      const chokePoints = SimPathLogic.identifyChokePoints(paths);
      
      const evasionBreakdown = await Promise.all(nodes.map(async n => ({
        node: n.name,
        score: await SimEvasionLogic.calculateOverallEvasion(actor, n),
        details: await SimEvasionLogic.getEvasionBreakdown(actor, n)
      })));

      if (isMounted()) {
        setResults({ paths, chokePoints, evasionBreakdown });
      }
    } catch (e) {
      if (isMounted()) setError((e as Error).message);
    } finally {
      if (isMounted()) setIsSimulating(false);
    }
  }, [nodes, actors, isMounted]);

  // Exfil Logic
  const calculateExfil = useCallback(async (targetNodeId: string) => {
    const targetNode = nodes.find(n => n.id === targetNodeId) || nodes.find(n => n.type === 'Database');
    if (!targetNode) return;

    try {
      const res = await SimExfilLogic.calculatePhysics(targetNode, exfilConfig);
      if (isMounted()) setExfilPhysics(res);
    } catch (e) {
      console.warn("Physics calc failed", e);
    }
  }, [nodes, exfilConfig, isMounted]);

  return {
    activeTab, setActiveTab,
    isSimulating,
    results,
    error,
    runSimulation,
    actors,
    nodes,
    exfilConfig, setExfilConfig,
    exfilPhysics, calculateExfil
  };
};
