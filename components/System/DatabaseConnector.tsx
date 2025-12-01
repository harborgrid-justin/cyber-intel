
import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Input, FilterGroup, CardHeader } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { MockAdapter, PostgresAdapter, DatabaseAdapter } from '../../services/dbAdapter';
import { CONFIG } from '../../config';

const DatabaseConnector: React.FC = () => {
  const [providerType, setProviderType] = useState<'MEMORY' | 'SQL'>('MEMORY');
  const [host, setHost] = useState(CONFIG.DATABASE.POSTGRES.HOST);
  const [user, setUser] = useState(CONFIG.DATABASE.POSTGRES.USER);
  const [dbName, setDbName] = useState(CONFIG.DATABASE.POSTGRES.DB_NAME);
  const [status, setStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('CONNECTED');
  const [logs, setLogs] = useState<string[]>([]);
  
  // Refresh logs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...threatData.adapter.logs]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setStatus('CONNECTING');
    let adapter: DatabaseAdapter;
    
    if (providerType === 'SQL') {
      adapter = new PostgresAdapter();
    } else {
      adapter = new MockAdapter();
    }

    try {
      await adapter.connect({ host, user, dbName, port: CONFIG.DATABASE.POSTGRES.PORT });
      threatData.setProvider(adapter);
      setStatus('CONNECTED');
    } catch (e) {
      setStatus('DISCONNECTED');
      alert("Connection Failed: Host unreachable");
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Card */}
        <Card className="p-0 overflow-hidden flex flex-col">
          <CardHeader 
            title="Database Adapter" 
            action={<Badge color={status === 'CONNECTED' ? 'green' : status === 'CONNECTING' ? 'yellow' : 'red'}>{status}</Badge>}
          />
          
          <div className="p-6 space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Persistence Engine</label>
              <FilterGroup
                value={providerType}
                onChange={(v) => setProviderType(v as any)}
                options={[
                  { label: 'In-Memory (Mock)', value: 'MEMORY' },
                  { label: 'PostgreSQL / Sequelize', value: 'SQL' }
                ]}
              />
            </div>

            {providerType === 'SQL' && (
              <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-3 gap-3">
                   <div className="col-span-2">
                     <label className="text-[10px] text-slate-500 uppercase font-bold">Host Endpoint</label>
                     <Input value={host} onChange={e => setHost(e.target.value)} />
                   </div>
                   <div>
                     <label className="text-[10px] text-slate-500 uppercase font-bold">Port</label>
                     <Input value={CONFIG.DATABASE.POSTGRES.PORT.toString()} disabled />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="text-[10px] text-slate-500 uppercase font-bold">Username</label>
                     <Input value={user} onChange={e => setUser(e.target.value)} />
                   </div>
                   <div>
                     <label className="text-[10px] text-slate-500 uppercase font-bold">Database</label>
                     <Input value={dbName} onChange={e => setDbName(e.target.value)} />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] text-slate-500 uppercase font-bold">Password</label>
                   <Input type="password" value="********" disabled />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <Button onClick={handleConnect} disabled={status === 'CONNECTING'} className="flex-1">
                {status === 'CONNECTING' ? 'ESTABLISHING LINK...' : 'CONNECT ADAPTER'}
              </Button>
              {providerType === 'SQL' && <Button variant="secondary">TEST PING</Button>}
            </div>
          </div>
        </Card>

        {/* Live Status Visualization */}
        <div className="flex flex-col gap-4">
           <Card className="flex-1 border-slate-800 flex flex-col p-0 overflow-hidden">
              <CardHeader title="Adapter Traffic Monitor" />
              <div className="relative flex-1 bg-slate-950 p-2 min-h-0 overflow-hidden flex flex-col">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                 <div className="font-mono text-xs space-y-1 h-64 overflow-y-auto custom-scrollbar relative z-10 p-2">
                    {logs.map((log, i) => (
                      <div key={i} className="border-l-2 border-slate-800 pl-2 py-0.5 animate-pulse">
                        <span className="text-slate-600 mr-2">{new Date().toLocaleTimeString()}</span>
                        <span className={log.includes('SQL') ? 'text-blue-400' : 'text-green-400'}>{log}</span>
                      </div>
                    ))}
                    {logs.length === 0 && <div className="text-slate-700 italic">No traffic on interface.</div>}
                 </div>
              </div>
           </Card>
           
           <div className="grid grid-cols-3 gap-4">
              <Card className="p-3 text-center">
                 <div className="text-[10px] text-slate-500 uppercase font-bold">Write Latency</div>
                 <div className="text-xl font-mono text-white font-bold">{providerType === 'SQL' ? '124ms' : '0ms'}</div>
              </Card>
              <Card className="p-3 text-center">
                 <div className="text-[10px] text-slate-500 uppercase font-bold">Active Conn</div>
                 <div className="text-xl font-mono text-cyan-500 font-bold">{providerType === 'SQL' ? '4' : '1'}</div>
              </Card>
              <Card className="p-3 text-center">
                 <div className="text-[10px] text-slate-500 uppercase font-bold">Encryption</div>
                 <div className="text-xl font-mono text-green-500 font-bold">TLS 1.3</div>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
};
export default DatabaseConnector;
