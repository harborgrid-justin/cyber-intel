
import React, { useState } from 'react';
import { Card, CardHeader, Input } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';

export const LogAnalysis: React.FC = () => {
    const [filter, setFilter] = useState('');
    const logs = useDataStore(() => threatData.getAuditLogs());
    
    const filteredLogs = logs.filter(l => l.details.includes(filter) || l.action.includes(filter));
    
    return (
      <Card className="h-full p-0 flex flex-col">
        <CardHeader title="Structured Log Viewer" action={<Input placeholder="Filter logs (grep)..." value={filter} onChange={e => setFilter(e.target.value)} className="w-48 text-xs" />} />
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 bg-slate-950">
          {filteredLogs.map(l => (
            <div key={l.id} className="border-l-2 border-slate-800 pl-2 hover:border-cyan-500 hover:bg-slate-900/50">
              <span className="text-slate-500">{l.timestamp}</span> <span className={l.action.includes('FAIL') ? 'text-red-400' : 'text-green-400'}>{l.action}</span> <span className="text-slate-300">{l.details}</span>
            </div>
          ))}
        </div>
      </Card>
    );
};
