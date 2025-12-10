
import React, { useState } from 'react';
import { Artifact } from '../../types';
import { Button, Input, Badge, CardHeader } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';

interface EvidenceManagerProps {
  artifacts: Artifact[];
  onAdd: (artifact: Artifact) => void;
  onDelete: (id: string) => void;
}

const EvidenceManager: React.FC<EvidenceManagerProps> = ({ artifacts, onAdd, onDelete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  
  const handleUpload = () => {
    if (!fileName) return;
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const newArtifact: Artifact = {
        id: `art-${Date.now()}`,
        name: fileName.replace('C:\\fakepath\\', ''),
        type: fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        size: `${(Math.random() * 10).toFixed(2)} MB`,
        hash: Array.from({length: 4}, () => Math.random().toString(16).substr(2, 8)).join('').substring(0, 32),
        uploadedBy: 'Analyst.Me',
        uploadDate: new Date().toLocaleDateString()
      };
      onAdd(newArtifact);
      setFileName('');
      setIsUploading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <CardHeader title="Evidence Locker" />
        <div className="p-6">
          <div className="flex gap-4 items-center mb-6 border-b border-slate-800 pb-6">
            <div className="flex-1 relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={(e) => setFileName(e.target.value)} 
              />
              <div className="bg-slate-950 border border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-cyan-500 transition-colors">
                <span className="text-slate-400 text-sm">
                  {fileName ? fileName : 'Drag & Drop files or Click to Upload'}
                </span>
              </div>
            </div>
            <Button onClick={handleUpload} disabled={!fileName || isUploading} variant="primary">
              {isUploading ? 'Uploading...' : 'Secure Upload'}
            </Button>
          </div>

          <ResponsiveTable<Artifact>
            data={artifacts}
            keyExtractor={a => a.id}
            columns={[
              { header: 'Filename', render: a => <span className="text-white font-mono font-bold text-xs">{a.name}</span> },
              { header: 'Type', render: a => <Badge color="slate">{a.type}</Badge> },
              { header: 'Size', render: a => <span className="text-slate-400 text-xs font-mono">{a.size}</span> },
              { header: 'MD5 Hash', render: a => <span className="text-cyan-600 font-mono text-[10px] truncate max-w-[100px] block" title={a.hash}>{a.hash}</span> },
              { header: 'Date', render: a => <span className="text-slate-500 text-[10px]">{a.uploadDate}</span> },
              { header: 'Action', render: a => <Button onClick={() => onDelete(a.id)} variant="text" className="text-red-500 text-[10px]">DEL</Button> }
            ]}
            renderMobileCard={a => (
               <div className="flex justify-between items-center">
                  <div>
                     <div className="text-white font-mono text-sm">{a.name}</div>
                     <div className="text-xs text-slate-500">{a.size} • {a.type}</div>
                  </div>
                  <Button onClick={() => onDelete(a.id)} variant="text" className="text-red-500">X</Button>
               </div>
            )}
          />
        </div>
      </div>
    </div>
  );
};
export default EvidenceManager;
