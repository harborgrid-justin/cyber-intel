import React, { useState } from 'react';
import { Card, CardHeader, Button, Badge, Input, Label } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import Modal from '../Shared/Modal';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { ApiKey } from '../../types';

export const APIKeySettings: React.FC = () => {
  const keys = useDataStore(() => threatData.getApiKeys());
  
  const [showModal, setShowModal] = useState(false);
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

  const handleClose = () => {
      setShowModal(false);
      setGeneratedSecret('');
      setNewKeyName('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
        <Modal isOpen={showModal} onClose={handleClose} title="Provision New API Key">
            {!generatedSecret ? (
                <div className="space-y-4">
                    <div>
                        <Label>Key Name</Label>
                        <Input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="e.g. Production Splunk Forwarder" />
                    </div>
                    <div className="bg-blue-900/10 p-4 rounded border border-blue-900/30 text-xs text-blue-200">
                        <Icons.Shield className="w-4 h-4 inline mr-2" />
                        This key will have <strong>READ-ONLY</strong> access by default. You can modify scopes after creation.
                    </div>
                    <Button onClick={handleGenerate} className="w-full">GENERATE KEY</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-green-900/10 p-4 rounded border border-green-900/30 text-center">
                        <div className="text-green-400 font-bold mb-2">Key Generated Successfully</div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-white break-all select-all cursor-text">
                            {generatedSecret}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                        Please copy this key now. For security reasons, it will <strong>never be shown again</strong>.
                    </p>
                    <Button onClick={handleClose} variant="secondary" className="w-full">I HAVE COPIED IT</Button>
                </div>
            )}
        </Modal>

        <Card className="p-0 overflow-hidden">
            <CardHeader title="Access Tokens" action={<Button onClick={() => setShowModal(true)} className="text-[10px]">+ PROVISION KEY</Button>} />
            <div className="divide-y divide-slate-800">
                {keys.map(k => (
                    <div key={k.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 hover:bg-slate-900 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded border ${k.status === 'ACTIVE' ? 'bg-cyan-900/10 border-cyan-900/30 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                <Icons.Key className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm flex items-center gap-2">
                                    {k.name}
                                    <Badge color={k.status === 'ACTIVE' ? 'green' : 'red'}>{k.status}</Badge>
                                </div>
                                <div className="text-xs text-slate-500 font-mono mt-1">
                                    {k.prefix} • Last used: {k.lastUsed}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="flex gap-1">
                                {k.scopes.map(s => <span key={s} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-bold text-slate-400">{s}</span>)}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="text" className="text-slate-400 hover:text-white text-xs">ROTATE</Button>
                                <Button variant="text" className="text-red-500 hover:text-red-400 text-xs">REVOKE</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {keys.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No active API keys found.</div>}
        </Card>
    </div>
  );
};