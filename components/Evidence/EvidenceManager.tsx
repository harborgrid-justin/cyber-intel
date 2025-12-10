
import React, { useState } from 'react';
import { Artifact } from '../../types';
import { Button, CardHeader } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { CompressionService } from '../../services/utils/Compression';

interface EvidenceManagerProps {
  artifacts: Artifact[];
  onAdd: (artifact: Artifact) => void;
  onDelete: (id: string) => void;
}

const EvidenceManager: React.FC<EvidenceManagerProps> = ({ artifacts, onAdd, onDelete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  
  const handleUpload = async () => {
    if (!fileName) return;
    setIsUploading(true);
    
    // Simulate reading file content and compressing
    const dummyContent = "A".repeat(1024 * 1024); // 1MB dummy
    const compressed = await CompressionService.compress(dummyContent);
    const sizeMB = (compressed.byteLength / (1024*1024)).toFixed(2);

    const newArtifact: Artifact = {
        id: `art-${Date.now()}`,
        name: fileName.replace('C:\\fakepath\\', ''),
        type: fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        size: `${sizeMB} MB (Compressed)`,
        hash: Array.from({length: 4}, () => Math.random().toString(16).substr(2, 8)).join('').substring(0, 32),
        uploadedBy: 'Analyst.Me',
        uploadDate: new Date().toLocaleDateString()
    };
    onAdd(newArtifact);
    setFileName('');
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <CardHeader title="Evidence Locker" />
        <div className="p-6">
          <div className="flex gap-4 items-center mb-6 border-b border-slate-800 pb-6">
            <input type="file" className="text-slate-400" onChange={(e) => setFileName(e.target.value)} />
            <Button onClick={handleUpload} disabled={!fileName || isUploading} variant="primary">
              {isUploading ? 'Compressing & Uploading...' : 'Secure Upload'}
            </Button>
          </div>
          <ResponsiveTable<Artifact>
            data={artifacts}
            keyExtractor={a => a.id}
            columns={[
              { header: 'Filename', render: a => <span className="text-white font-mono text-xs font-bold">{a.name}</span> },
              { header: 'Size', render: a => <span className="text-slate-400 text-xs font-mono">{a.size}</span> },
              { header: 'Action', render: a => <Button onClick={() => onDelete(a.id)} variant="text" className="text-red-500 text-[10px]">DEL</Button> }
            ]}
            renderMobileCard={a => <div>{a.name}</div>}
          />
        </div>
      </div>
    </div>
  );
};
export default EvidenceManager;
