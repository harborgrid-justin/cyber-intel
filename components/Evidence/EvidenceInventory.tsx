import React, { useState } from 'react';
import { Card, Button, Badge, FilterGroup, CardHeader } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { Artifact } from '../../types';
import { ForensicsLogic } from '../../services/logic/ForensicsLogic';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';

interface EvidenceItem extends Artifact { caseId: string; caseTitle: string; }
interface Props { artifacts: EvidenceItem[]; handleNavigateCase: (id: string) => void; }

const EvidenceInventory: React.FC<Props> = ({ artifacts, handleNavigateCase }) => {
  const [filterType, setFilterType] = useState('ALL');
  const allCases = useDataStore(() => threatData.getCases());
  const filtered = filterType === 'ALL' ? artifacts : artifacts.filter(a => a.type === filterType);
  const totalSize = artifacts.reduce((acc, c) => acc + (parseFloat(c.size) || 0), 0);

  const verifyHash = async (artifact: EvidenceItem) => {
    const check = await ForensicsLogic.verifyArtifactIntegrity(artifact);
    const newStatus = check.valid ? 'SECURE' : 'COMPROMISED';
    const parentCase = allCases.find(c => c.id === artifact.caseId);
    if (parentCase) {
        const updatedArtifacts = parentCase.artifacts.map(a => a.id === artifact.id ? { ...a, status: newStatus as any } : a);
        threatData.updateCase({ ...parentCase, artifacts: updatedArtifacts });
    }
    alert(`Integrity Check for ${artifact.name}: ${check.valid ? 'PASSED' : 'FAILED'}`);
  };

  return (
    <Card className="p-0 overflow-hidden flex flex-col h-full">
      <CardHeader title="Evidence Inventory" action={<div className="text-xs text-slate-500 font-mono">{filtered.length} ITEMS | {totalSize.toFixed(2)} MB</div>} />
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
         <FilterGroup value={filterType} onChange={setFilterType} options={['ALL', 'BINARY', 'LOG', 'IMAGE', 'DOCUMENT'].map(t => ({ label: t, value: t }))} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ResponsiveTable<EvidenceItem> data={filtered} keyExtractor={a => a.id + a.caseId} columns={[
            { header: 'Case Ref', render: a => <div onClick={() => handleNavigateCase(a.caseId)} className="cursor-pointer group"><div className="text-cyan-500 font-mono text-xs group-hover:underline">{a.caseId}</div><div className="text-[10px] text-slate-500 w-32 truncate">{a.caseTitle}</div></div> },
            { header: 'Filename', render: a => <span className="text-white font-bold text-xs font-mono">{a.name}</span> },
            { header: 'Type', render: a => <Badge color="slate">{a.type}</Badge> },
            { header: 'Hash', render: a => <span className="text-cyan-600 font-mono text-[10px] truncate max-w-[100px]">{a.hash}</span> },
            { header: 'Status', render: a => <Badge color={a.status === 'COMPROMISED' ? 'red' : 'green'}>{a.status || 'SECURE'}</Badge> },
            { header: 'Actions', render: a => <Button variant="text" onClick={() => verifyHash(a)} className="text-xs">VERIFY</Button> }
        ]} renderMobileCard={a => <div>{a.name}</div>} />
      </div>
    </Card>
  );
};
export default EvidenceInventory;