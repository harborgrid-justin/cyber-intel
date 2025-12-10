
import React, { useState } from 'react';
import { Card, CardHeader, Button, Input, Label } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { threatData } from '../../../services/dataLayer';
import { ApiKey } from '../../../types';
import { DetailViewHeader } from '../../Shared/Layouts';

interface CreateApiKeyPageProps {
  onClose: () => void;
}

export const CreateApiKeyPage: React.FC<CreateApiKeyPageProps> = ({ onClose }) => {
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedSecret, setGeneratedSecret] = useState('');

  const handleGenerate = async () => {
    if (!newKeyName) return;
    
    const rawKey = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
    const prefix = `sk_live_${rawKey.substring(0, 8)}`;
    
    setGeneratedSecret(`${prefix}_${rawKey.substring(8)}`);
    
    const newKey: ApiKey = {
        id: `k-${Date.now()}`,
        name: newKeyName,
        prefix: `${prefix}...`,
        created: new Date().toLocaleDateString(),
        lastUsed: 'Never',
        scopes: ['READ'],
        status: 'ACTIVE'
    };

    threatData.addApiKey(newKey);
  };

  return (
    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl animate-in fade-in duration-300">
        <DetailViewHeader title="Provision New API Key" subtitle="API Access Management" onBack={onClose} />
        <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <div className="max-w-md w-full">
                {!generatedSecret ? (
                    <Card className="p-6 space-y-4">
                        <div>
                            <Label>Key Name</Label>
                            <Input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="e.g. Production Splunk Forwarder" autoFocus />
                        </div>
                        <div className="bg-blue-900/10 p-4 rounded border border-blue-900/30 text-xs text-blue-200">
                            <Icons.Shield className="w-4 h-4 inline mr-2" />
                            This key will have <strong>READ-ONLY</strong> access by default. You can modify scopes after creation.
                        </div>
                        <Button onClick={handleGenerate} className="w-full">GENERATE KEY</Button>
                    </Card>
                ) : (
                    <Card className="p-6 space-y-4">
                        <div className="bg-green-900/10 p-4 rounded border border-green-900/30 text-center">
                            <div className="text-green-400 font-bold mb-2">Key Generated Successfully</div>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-white break-all select-all cursor-text">
                                {generatedSecret}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 text-center">
                            Please copy this key now. For security reasons, it will <strong>never be shown again</strong>.
                        </p>
                        <Button onClick={onClose} variant="secondary" className="w-full">I HAVE COPIED IT</Button>
                    </Card>
                )}
            </div>
        </div>
    </div>
  );
};
