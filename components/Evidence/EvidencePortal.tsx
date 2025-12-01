
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Grid } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { threatData } from '../../services/dataLayer';
import { Case, ChainEvent, Malware, ForensicJob, Device, Pcap, View } from '../../types';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import EvidenceInventory from './EvidenceInventory';
import { CustodyChain, MalwareVault, ForensicsLab } from './Views/ForensicsViews';

const EvidencePortal: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.EVIDENCE[0]);
  const [cases, setCases] = useState<Case[]>(threatData.getCases());
  const [chain, setChain] = useState<ChainEvent[]>(threatData.getChainOfCustody());
  const [malware, setMalware] = useState<Malware[]>(threatData.getMalwareSamples());
  const [jobs, setJobs] = useState<ForensicJob[]>(threatData.getForensicJobs());
  const [devices, setDevices] = useState<Device[]>(threatData.getDevices());
  const [pcaps, setPcaps] = useState<Pcap[]>(threatData.getNetworkCaptures());

  useEffect(() => {
    const refresh = () => {
        setCases(threatData.getCases()); 
        setChain(threatData.getChainOfCustody());
        setMalware(threatData.getMalwareSamples());
        setJobs(threatData.getForensicJobs());
        setDevices(threatData.getDevices());
        setPcaps(threatData.getNetworkCaptures());
    };
    refresh();
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  const handleNavigateCase = (id: string) => window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.CASES, id } }));
  const allArtifacts = cases.flatMap(c => c.artifacts.map(a => ({ ...a, caseId: c.id, caseTitle: c.title })));
  const startJob = (target: string, type: string) => { threatData.addForensicJob({ id: `j-${Date.now()}`, type, target, status: 'QUEUED', progress: 0, technician: 'Analyst.Me' }); };

  return (
    <StandardPage title="Evidence Management" subtitle="Chain of Custody & Forensics" actions={<Button variant="secondary">EXPORT CUSTODY LOGS</Button>} modules={CONFIG.MODULES.EVIDENCE} activeModule={activeModule} onModuleChange={setActiveModule}>
      {activeModule === 'Inventory' && <EvidenceInventory artifacts={allArtifacts} handleNavigateCase={handleNavigateCase} />}
      {activeModule === 'Chain of Custody' && <CustodyChain data={chain} />}
      {activeModule === 'Malware Vault' && <MalwareVault data={malware} />}
      {activeModule === 'Forensics Lab' && <ForensicsLab jobs={jobs} onQueue={startJob} />}

      {activeModule === 'Storage' && (
        <Grid cols={2}>
           <Card className="p-6 flex flex-col items-center justify-center"><div className="w-32 h-32 rounded-full border-8 border-slate-800 border-t-cyan-500 flex items-center justify-center text-2xl font-bold text-white mb-4">42%</div><div className="text-sm font-bold text-slate-400 uppercase">Vault Capacity</div></Card>
           <div className="space-y-2"><Card className="p-4 flex justify-between"><span className="text-slate-300">Evidence Retention</span><span className="text-white font-bold">365 Days</span></Card><Card className="p-4 flex justify-between"><span className="text-slate-300">Cold Storage</span><span className="text-white font-bold">12.5 TB</span></Card><Card className="p-4 flex justify-between"><span className="text-slate-300">Active Case Data</span><span className="text-white font-bold">1.2 TB</span></Card></div>
        </Grid>
      )}

      {activeModule === 'Device Locker' && (
        <ResponsiveTable<Device> data={devices} keyExtractor={d => d.id} columns={[{ header: 'Device Name', render: d => <span className="text-white font-bold">{d.name}</span> }, { header: 'Type', render: d => <Badge>{d.type}</Badge> }, { header: 'Serial', render: d => <span className="font-mono text-xs text-slate-400">{d.serial}</span> }, { header: 'Custodian', render: d => <span className="text-cyan-500 text-xs">{d.custodian}</span> }, { header: 'Status', render: d => <Badge color={d.status === 'SECURE' ? 'green' : 'orange'}>{d.status}</Badge> }]} renderMobileCard={d => <div className="flex justify-between"><div><div className="font-bold text-white">{d.name}</div><div className="text-xs text-slate-500">{d.serial}</div></div><Badge>{d.status}</Badge></div>} />
      )}

      {activeModule === 'Network Captures' && (
        <ResponsiveTable<Pcap> data={pcaps} keyExtractor={p => p.id} columns={[{ header: 'File', render: p => <span className="text-white font-mono text-sm">{p.name}</span> }, { header: 'Size', render: p => <span className="text-slate-400 text-xs">{p.size}</span> }, { header: 'Source', render: p => <span className="text-slate-300 text-xs">{p.source}</span> }, { header: 'Analysis', render: p => <Badge color={p.analysisStatus === 'ANALYZED' ? 'green' : 'blue'}>{p.analysisStatus}</Badge> }, { header: 'Action', render: p => <Button variant="text" className="text-cyan-500 text-[10px]">DOWNLOAD PCAP</Button> }]} renderMobileCard={p => <div className="flex justify-between items-center"><div className="font-mono text-white text-sm">{p.name}</div><Badge>{p.analysisStatus}</Badge></div>} />
      )}
    </StandardPage>
  );
};
export default EvidencePortal;
