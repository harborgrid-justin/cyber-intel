
import React, { useState, useEffect } from 'react';
import { getRecentJobs, mockParseSTIX } from '../../services-frontend/ingestionService';
import { threatData } from '../../services-frontend/dataLayer';
import { IoCFeed } from '../../types';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { StandardPage } from '../Shared/Layouts';
import { Button, Card, Badge, Grid, CardHeader } from '../Shared/UI';
import { CONFIG } from '../../config';
import ParsersView from './ParsersView';
import EnrichmentView from './EnrichmentView';
import NormalizationView from './NormalizationView';
import CreateFeedForm from './CreateFeedForm';

const IngestionManager: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.INGESTION[0]);
  const [feeds, setFeeds] = useState(threatData.getFeeds());
  const [isCreating, setIsCreating] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const jobs = getRecentJobs();

  useEffect(() => {
    const refresh = () => setFeeds(threatData.getFeeds());
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  const toggle = (id: string) => { threatData.toggleFeed(id); };
  const handleDelete = (id: string) => { threatData.deleteFeed(id); };
  
  const handleSync = async (feed: IoCFeed) => {
    setSyncingId(feed.id);
    await new Promise(r => setTimeout(r, 1200));
    
    const newThreats = mockParseSTIX('', feed.name);
    newThreats.forEach(t => threatData.addThreat(t));
    
    feed.lastSync = 'Just now';
    threatData.feedStore.update(feed);
    
    setSyncingId(null);
    alert(`Ingested ${newThreats.length} new indicators from ${feed.name}`);
  };

  const handleConnectSource = (sourceName: string) => {
    if (feeds.some(f => f.name === sourceName)) return alert(`${sourceName} is already connected.`);
    threatData.addFeed({
      id: `FEED-${Date.now()}`, name: sourceName, url: `api.connector.${sourceName.toLowerCase()}.local`,
      type: 'SIEM_CONNECTOR', status: 'ACTIVE', interval: 15, lastSync: 'Just now'
    });
  };

  return (
    <StandardPage title="Data Ingestion Hub" subtitle="Connect and Manage Intelligence Sources" actions={<Button onClick={() => setIsCreating(true)}>+ ADD SOURCE</Button>} modules={CONFIG.MODULES.INGESTION} activeModule={activeModule} onModuleChange={setActiveModule}>
      {isCreating && (
        <CreateFeedForm onCancel={() => setIsCreating(false)} onSuccess={() => setIsCreating(false)} />
      )}

      {activeModule === 'Status' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-0 min-h-[400px] overflow-hidden">
               <CardHeader title="Active Intelligence Feeds" />
               <ResponsiveTable<IoCFeed> data={feeds} keyExtractor={f => f.id}
                   columns={[
                      { header: 'Source', render: f => <div><div className="font-bold text-white">{f.name}</div><div className="text-[10px] text-slate-500">Last Sync: {f.lastSync}</div></div> },
                      { header: 'Type', render: f => <Badge>{f.type}</Badge> },
                      { header: 'Actions', render: f => <div className="flex gap-2"><Button onClick={() => handleSync(f)} variant="secondary" className="text-[10px] py-1" disabled={f.status !== 'ACTIVE' || syncingId === f.id}>{syncingId === f.id ? 'SYNCING...' : 'SYNC NOW'}</Button><button onClick={() => toggle(f.id)} className={`px-2 py-0.5 text-[10px] font-bold border rounded ${f.status === 'ACTIVE' ? 'text-green-500 border-green-900' : 'text-slate-500 border-slate-700'}`}>{f.status}</button><button onClick={() => handleDelete(f.id)} className="text-red-500 text-xs hover:underline">DEL</button></div> }
                   ]}
                   renderMobileCard={f => <div className="flex justify-between items-center"><div><div className="text-white font-bold">{f.name}</div><div className="text-xs text-slate-500">{f.type}</div></div><Button onClick={() => handleSync(f)} disabled={syncingId === f.id} variant="secondary" className="text-[10px]">{syncingId === f.id ? '...' : 'SYNC'}</Button></div>}
                 />
            </Card>
          </div>
          <Card className="p-0 h-fit overflow-hidden">
             <CardHeader title="Job History" />
             <div className="p-4 space-y-3">
               {jobs.map(j => (
                 <div key={j.id} className="flex justify-between border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                   <div><p className="text-slate-200 text-sm">{j.source}</p><p className="text-[10px] text-slate-500">{j.timestamp}</p></div>
                   <Badge color={j.status === 'COMPLETED' ? 'green' : 'yellow'}>{j.status}</Badge>
                 </div>
               ))}
             </div>
          </Card>
        </div>
      )}

      {activeModule === 'Sources' && <Grid cols={3}>{['Splunk', 'Elastic', 'AWS GuardDuty', 'Azure Sentinel', 'CrowdStrike', 'Darktrace'].map(s => <Card key={s} className="p-6 flex flex-col justify-between h-40 hover:border-cyan-500 cursor-pointer transition-colors group"><div className="flex justify-between"><h3 className="font-bold text-white text-lg group-hover:text-cyan-400">{s}</h3><Badge color="blue">CONNECTOR</Badge></div><Button onClick={() => handleConnectSource(s)} variant="secondary" className="w-full">CONFIGURE</Button></Card>)}</Grid>}
      
      {activeModule === 'Schedule' && (
        <Card className="p-0 overflow-hidden">
           <CardHeader title="Ingestion Schedules" />
           <div className="p-4">
             <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950 text-xs uppercase"><tr className="text-slate-500"><th>Job Name</th><th>Frequency</th><th>Last Run</th><th>Status</th></tr></thead>
                <tbody className="divide-y divide-slate-800"><tr><td className="py-3 text-white">Full Threat Sync</td><td className="py-3">Every 1 Hour</td><td className="py-3">10 mins ago</td><td className="py-3 text-green-500">ACTIVE</td></tr></tbody>
             </table>
           </div>
        </Card>
      )}
      
      {activeModule === 'Parsers' && <ParsersView />}
      {activeModule === 'Enrichment' && <EnrichmentView />}
      {activeModule === 'Normalization' && <NormalizationView />}
    </StandardPage>
  );
};
export default IngestionManager;
