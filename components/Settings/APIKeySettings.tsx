
import React, { useState } from 'react';
import { Card, CardHeader, Button, Badge } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { CreateApiKeyPage } from './views/CreateApiKeyPage';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { ApiKey } from '../../types';

export const APIKeySettings: React.FC = () => {
  const keys = useDataStore(() => threatData.getApiKeys());
  const [isCreating, setIsCreating] = useState(false);

  if (isCreating) {
    return <CreateApiKeyPage onClose={() => setIsCreating(false)} />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
        <Card className="p-0 overflow-hidden">
            <CardHeader title="Access Tokens" action={<Button onClick={() => setIsCreating(true)} className="text-[10px]">+ PROVISION KEY</Button>} />
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
