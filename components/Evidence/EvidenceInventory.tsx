
import React, { useState } from 'react';
import { Card, Button, Badge } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { Artifact, View } from '../../types';

interface EvidenceItem extends Artifact { caseId: string; caseTitle: string; }

interface EvidenceInventoryProps {
  artifacts: EvidenceItem[];
  handleNavigateCase: (id: string) => void;
}

const EvidenceInventory: React.FC<EvidenceInventoryProps> = ({ artifacts, handleNavigateCase }) => {
  const [filterType, setFilterType] = useState('ALL');
  const filtered = filterType === 'ALL' ? artifacts : artifacts.filter(a => a.type === filterType);
  const totalSize = artifacts.reduce((acc, c) => acc + (parseFloat(c.size) || 0), 0);

  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
         <div className="flex flex-wrap gap-2">
            {['ALL', 'BINARY', 'LOG', 'IMAGE', 'DOCUMENT'].map(t => (
               <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1 text-[10px] font-bold rounded uppercase ${filterType === t ? 'bg-cyan-900 text-cyan-400 border border-cyan-700' : 'bg-slate-950 text-slate-500 border border-slate-800'}`}>{t}</button>
            ))}
         </div>
         <div className="text-xs text-slate-500 font-mono text-right">{filtered.length} ITEMS | {totalSize.toFixed(2)} MB</div>
      </div>
      <ResponsiveTable<EvidenceItem>
        data={filtered} keyExtractor={a => a.id + a.caseId}
        columns={[
          { header: 'Case Ref', render: a => 
            <div onClick={() => handleNavigateCase(a.caseId)} className="cursor-pointer group">
              <div className="text-cyan-500 font-mono text-xs group-hover:underline">{a.caseId}</div>
              <div className="text-[10px] text-slate-500 w-32 truncate">{a.caseTitle}</div>
            </div> 
          },
          { header: 'Filename', render: a => <span className="text-white font-bold text-xs font-mono">{a.name}</span> },
          { header: 'Type', render: a => <Badge color={a.type === 'BINARY' ? 'red' : 'slate'}>{a.type}</Badge> },
          { header: 'Size', render: a => <span className="text-slate-400 text-xs font-mono">{a.size}</span> },
          { header: 'Actions', render: a => <Button variant="text" className="text-cyan-500 text-[10px]">DOWNLOAD</Button> }
        ]}
        renderMobileCard={a => <div className="flex justify-between items-center"><div><div className="text-white font-bold">{a.name}</div><div onClick={() => handleNavigateCase(a.caseId)} className="text-xs text-cyan-500 cursor-pointer">{a.caseId}</div></div><Badge>{a.type}</Badge></div>}
      />
    </Card>
  );
};
export default EvidenceInventory;
