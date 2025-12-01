
import React, { useState } from 'react';
import { Card, Button, Input, Badge, Grid } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import { threatData } from '../../services/dataLayer';

const OsintDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.OSINT[0]);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const domainData = threatData.getOsintDomains();
  const breachData = threatData.getOsintBreaches();
  const socialData = threatData.getOsintSocial();
  const geoData = threatData.getOsintGeo();
  const darkData = threatData.getOsintDarkWeb();
  const metaData = threatData.getOsintMeta();

  const handleSearch = () => { if(!query) return; setIsSearching(true); setTimeout(() => setIsSearching(false), 800); };
  const handleDeepScan = (target: string) => alert(`Deep scan: ${target}`);

  return (
    <StandardPage 
      title="OSINT Toolkit" 
      subtitle="Open Source Intelligence Gathering"
      modules={CONFIG.MODULES.OSINT} 
      activeModule={activeModule} 
      onModuleChange={setActiveModule}
    >
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Input 
            className="flex-1" 
            placeholder="Target domain, IP, email, or handle..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
          />
          <Button variant="primary" onClick={handleSearch} disabled={isSearching} className="whitespace-nowrap">
            {isSearching ? 'SCANNING NETWORKS...' : 'EXECUTE RECONNAISSANCE'}
          </Button>
        </div>
      </Card>

      {activeModule === 'Central Search' && (
        <Grid cols={2}>
           <Card className="p-4"><h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Recent Queries</h3><div className="space-y-2">{['192.168.1.55', 'ceo@target.com'].map((q, i) => <div key={i} className="flex justify-between text-sm bg-slate-950 p-2 rounded border border-slate-800"><span className="text-slate-300 font-mono">{q}</span></div>)}</div></Card>
           <Card className="p-4"><h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Trending Topics</h3><div className="flex flex-wrap gap-2">{['APT29', 'ZeroDay', 'Leak', 'Ransomware'].map(tag => <Badge key={tag} color="slate">{tag}</Badge>)}</div></Card>
        </Grid>
      )}

      {activeModule === 'Domain Intel' && (
        <ResponsiveTable data={domainData} keyExtractor={d => d.domain} columns={[{ header: 'Domain', render: d => <div><div className="text-white font-bold">{d.domain}</div><div className="text-xs text-slate-500">{d.registrar}</div></div> }, { header: 'DNS', render: d => <div className="text-cyan-500 text-xs font-mono">{d.dns}</div> }, { header: 'Status', render: d => <Badge color={d.status === 'Active' ? 'red' : 'green'}>{d.status}</Badge> }, { header: 'Action', render: d => <Button variant="text" className="text-[10px]" onClick={() => handleDeepScan(d.domain)}>SCAN</Button> }]} renderMobileCard={d => <div>{d.domain}</div>} />
      )}

      {activeModule === 'Email Breach' && (
         <ResponsiveTable data={breachData} keyExtractor={b => b.breach + b.email} columns={[{ header: 'Email', render: b => <span className="text-white font-bold">{b.email}</span> }, { header: 'Breach', render: b => <span className="text-red-400 font-bold">{b.breach}</span> }, { header: 'Data', render: b => <span className="text-slate-300 text-xs">{b.data}</span> }, { header: 'Verify', render: b => <Button variant="outline" className="text-[10px]">VERIFY</Button> }]} renderMobileCard={b => <div>{b.email}</div>} />
      )}

      {activeModule === 'Social Graph' && (
         <Grid cols={3}>{socialData.map(s => <Card key={s.handle} className="p-4 flex flex-col gap-4"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">{s.platform[0]}</div><div><h3 className="font-bold text-white">{s.handle}</h3><div className="text-xs text-slate-400">{s.platform}</div></div><Badge>{s.sentiment}</Badge></div><p className="text-xs text-slate-300 italic bg-slate-950 p-2 rounded">"{s.bio}"</p></Card>)}</Grid>
      )}

      {activeModule === 'IP Geolocation' && (
         <ResponsiveTable data={geoData} keyExtractor={i => i.ip} columns={[{ header: 'IP', render: i => <span className="text-white font-bold font-mono">{i.ip}</span> }, { header: 'Loc', render: i => <span className="text-slate-300">{i.city}, {i.country}</span> }, { header: 'ASN', render: i => <span className="text-xs text-slate-400">{i.asn}</span> }, { header: 'Score', render: i => <Badge color={i.threatScore > 80 ? 'red' : 'green'}>{i.threatScore}</Badge> }]} renderMobileCard={i => <div>{i.ip}</div>} />
      )}

      {activeModule === 'Dark Web' && (
         <div className="space-y-4">{darkData.map((d, i) => <Card key={i} className="p-4 border-l-4 border-l-red-900 bg-red-900/5"><div className="flex justify-between mb-2"><span className="text-xs font-bold text-red-500">{d.source}</span><span className="text-green-400 font-bold">{d.price}</span></div><h3 className="text-white font-bold text-lg mb-2">{d.title}</h3></Card>)}</div>
      )}

      {activeModule === 'Metadata' && (
        <div className="space-y-6"><Card className="flex justify-center p-8 border-dashed border-slate-700 bg-slate-900/30 cursor-pointer hover:border-cyan-500 transition-colors"><div className="text-center"><div className="text-2xl mb-2">📄</div><p className="text-slate-400 font-bold uppercase text-sm">Drop files for analysis</p></div></Card><ResponsiveTable data={metaData} keyExtractor={f => f.name} columns={[{ header: 'File', render: f => <div className="text-white font-mono">{f.name}</div> }, { header: 'GPS', render: f => <span className="text-xs">{f.gps}</span> }]} renderMobileCard={f => <div>{f.name}</div>} /></div>
      )}
    </StandardPage>
  );
};
export default OsintDashboard;
