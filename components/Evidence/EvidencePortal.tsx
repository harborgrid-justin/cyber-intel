
import React from 'react';
import { Button } from '../Shared/UI';
import { StandardPage } from '../Shared/Layouts';
import EvidenceInventory from './EvidenceInventory';
import { CustodyChainView } from './Views/ChainViews';
import { MalwareVaultView, ForensicsLabView } from './Views/LabViews';
import { DeviceLockerView, StorageOpsView, NetworkCapturesView } from './Views/AssetViews';
import { useEvidenceOperations } from '../../hooks/modules/useEvidenceOperations';

const EvidencePortal: React.FC = () => {
  const {
    modules, activeModule, setActiveModule,
    allArtifacts, chain, malware, jobs, devices, pcaps,
    handleNavigateCase, handleExportCustody
  } = useEvidenceOperations();

  return (
    <StandardPage 
        title="Evidence Management" 
        subtitle="Chain of Custody & Forensics" 
        actions={<Button onClick={handleExportCustody} variant="secondary">EXPORT CUSTODY LOGS</Button>} 
        modules={modules} 
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
