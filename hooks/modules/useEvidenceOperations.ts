
import { useState, useMemo, useCallback } from 'react';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../useDataStore';
import { View, Artifact } from '../../types';

export const useEvidenceOperations = () => {
  const modules = useMemo(() => threatData.getModulesForView(View.EVIDENCE), []);
  const [activeModule, setActiveModule] = useState(modules[0]);

  // Efficient subscriptions
  const cases = useDataStore(() => threatData.getCases());
  const chain = useDataStore(() => threatData.getChainOfCustody());
  const malware = useDataStore(() => threatData.getMalwareSamples());
  const jobs = useDataStore(() => threatData.getForensicJobs());
  const devices = useDataStore(() => threatData.getDevices());
  const pcaps = useDataStore(() => threatData.getNetworkCaptures());

  // Derived state
  const allArtifacts = useMemo(() => {
    return cases.flatMap(c => c.artifacts.map(a => ({ 
      ...a, 
      caseId: c.id, 
      caseTitle: c.title 
    })));
  }, [cases]);

  const handleNavigateCase = useCallback((id: string) => {
    window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.CASES, id } }));
  }, []);

  const handleExportCustody = useCallback(() => {
    if (chain.length === 0) return;
    const csv = "Date,Artifact,Action,User,Notes\n" + chain.map(c => `${c.date},${c.artifactName},${c.action},${c.user},${c.notes}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = 'chain_of_custody_full.csv'; 
    a.click();
    URL.revokeObjectURL(url); // Cleanup
  }, [chain]);

  return {
    modules, activeModule, setActiveModule,
    allArtifacts, chain, malware, jobs, devices, pcaps,
    handleNavigateCase, handleExportCustody
  };
};
