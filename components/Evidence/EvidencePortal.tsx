
import React, { useState, useEffect } from 'react';
import { Button } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { Case, ChainEvent, Malware, ForensicJob, Device, Pcap, View } from '../../types';
import { StandardPage } from '../Shared/Layouts';
import EvidenceInventory from './EvidenceInventory';
import { CustodyChainView } from './Views/ChainViews';
import { MalwareVaultView, ForensicsLabView } from './Views/LabViews';
import { DeviceLockerView, StorageOpsView, NetworkCapturesView } from './Views/AssetViews';

const EvidencePortal: React.FC = () => {
  const [activeModule, setActiveModule] = useState('Inventory');
  const [cases, setCases] = useState<Case[]>(threatData.getCases());
  const [chain, setChain] = useState<ChainEvent[]>(threatData.getChainOfCustody());
  const [malware, setMalware] = useState<Malware[]>(threatData.getMalwareSamples());
  const [jobs, setJobs] = useState<ForensicJob[]>(threatData.getForensicJobs());
  const [devices, setDevices] = useState<Device[]>(threatData.getDevices());
  const [pcaps, setPcaps] = useState<Pcap[]>(threatData.getNetworkCaptures());

  useEffect(() => {
    const refresh = () => {
        setCases(threatData.getCases()); setChain(threatData.getChainOfCustody());
        setMalware(threatData.getMalwareSamples()); setJobs(threatData.getForensicJobs());
        setDevices(threatData.getDevices()); setPcaps(threatData.getNetworkCaptures());
    };
    refresh();
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  const handleNavigateCase = (id: string) => window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.CASES, id } }));
  const allArtifacts = cases.flatMap(c => c.artifacts.map(a => ({ ...a, caseId: c.id, caseTitle: c.title })));
  
  const handleExportCustody = () => {
    const csv = "Date,Artifact,Action,User,Notes\n" + chain.map(c => `${c.date},${c.artifactName},${c.action},${c.user},${c.notes}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'chain_of_custody_full.csv'; a.click();
  };

  const MODULES = ['Inventory', 'Chain of Custody', 'Malware Vault', 'Forensics Lab', 'Network Captures', 'Device Locker', 'Storage'];

  return (
    <StandardPage 
        title="Evidence Management" 
        subtitle="Chain of Custody & Forensics" 
        actions={<Button onClick={handleExportCustody} variant="secondary">EXPORT CUSTODY LOGS</Button>} 
        modules={MODULES} 
        activeModule={activeModule} 
        onModuleChange={setActiveModule}
    >
        <div className="flex-1 min-h-0 overflow-hidden">
            {activeModule === 'Inventory' && <EvidenceInventory artifacts={allArtifacts} handleNavigateCase={handleNavigateCase} />}
            {activeModule === 'Chain of Custody' && <CustodyChainView data={chain} artifacts={allArtifacts} />}
            {activeModule === 'Malware Vault' && <MalwareVaultView data={malware} />}
            {activeModule === 'Forensics Lab' && <ForensicsLabView jobs={jobs} />}
            {activeModule === 'Device Locker' && <DeviceLockerView devices={devices} />}
            {activeModule === 'Network Captures' && <NetworkCapturesView pcaps={pcaps} />}
            {activeModule === 'Storage' && <StorageOpsView artifacts={allArtifacts} />}
        </div>
    </StandardPage>
  );
};
export default EvidencePortal;
