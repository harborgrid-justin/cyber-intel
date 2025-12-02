
import React, { useState, useMemo } from 'react';
import { Card, Button, Input, Badge, Grid, CardHeader, ProgressBar } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { threatData } from '../../../services-frontend/dataLayer';
import { OsintLogic } from '../../../services-frontend/logic/OsintLogic';
import { Icons } from '../../Shared/Icons';
import { OsintDomain } from '../../../types';

export const SearchViews = {
  CentralSearch: () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    
    const handleSearch = () => {
      const data = {
        domains: threatData.getOsintDomains(),
        breaches: threatData.getOsintBreaches(),
        social: threatData.getOsintSocial(),
        ips: threatData.getOsintGeo(),
        threats: threatData.getThreats()
      };
      setResults(OsintLogic.globalSearch(query, data));
    };

    return (
      <div className="flex flex-col h-full gap-6">
        <Card className="p-0 overflow-hidden shrink-0">
            <CardHeader title="Intelligence Search Engine" />
            <div className="p-6 flex gap-4">
              <Input 
                className="flex-1 text-lg" 
                placeholder="Search IOCs, emails, domains, handles..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="primary" onClick={handleSearch} className="px-8">SEARCH</Button>
            </div>
        </Card>

        {results.length > 0 ? (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-4">
             {results.map((r, i) => (
               <Card key={i} className="p-4 hover:border-cyan-500 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <Badge color="blue">{r.type}</Badge>
                       <span className="font-bold text-white text-lg">
                         {r.val.indicator || r.val.domain || r.val.email || r.val.handle || r.val.ip}
                       </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">ID: {r.val.id || 'N/A'}</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    {JSON.stringify(r.val).substring(0, 150)}...
                  </div>
               </Card>
             ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
             <Icons.Shuffle className="w-16 h-16 opacity-20 mb-4" />
             <div className="text-sm font-bold uppercase tracking-widest">No Results Found</div>
          </div>
        )}
      </div>
    );
  },

  DomainIntel: () => {
    const domains = threatData.getOsintDomains();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = domains.find(d => d.domain === selectedId) || domains[0];
    
    // New Logic Integration
    const dnsSec = useMemo(() => selected ? OsintLogic.Domain.checkDnsSecurity(selected) : null, [selected]);
    const squats = useMemo(() => selected ? OsintLogic.Domain.generateTyposquats(selected.domain) : [], [selected]);
    const regRisk = useMemo(() => selected ? OsintLogic.Domain.calculateRegistrarRisk(selected.registrar) : 0, [selected]);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
         <Card className="lg:col-span-1 p-0 overflow-hidden flex flex-col">
            <CardHeader title="Monitored Domains" />
            <div className="flex-1 overflow-y-auto">
               <ResponsiveTable<OsintDomain> 
                 data={domains} 
                 keyExtractor={d => d.domain}
                 columns={[
                   { header: 'Domain', render: d => <span className="font-bold text-white">{d.domain}</span> },
                   { header: 'Status', render: d => <Badge color={d.status === 'Active' ? 'red' : 'green'}>{d.status}</Badge> }
                 ]}
                 renderMobileCard={d => <div>{d.domain}</div>}
               />
            </div>
         </Card>

         <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2">
            <Card className="p-6 border-l-4 border-l-cyan-500">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <h2 className="text-2xl font-bold text-white mb-1">{selected.domain}</h2>
                     <div className="flex gap-2 text-xs text-slate-400 font-mono">
                        <span>REG: {selected.registrar}</span> | <span>CREATED: {selected.created}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registrar Risk</div>
                     <div className={`text-3xl font-bold font-mono ${regRisk > 50 ? 'text-red-500' : 'text-green-500'}`}>{regRisk}/100</div>
                  </div>
               </div>
               
               <div className="bg-slate-950 p-4 rounded border border-slate-800 mb-4">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-3">DNS Security Matrix</div>
                  <div className="flex gap-4">
                     <div className={`flex-1 p-2 rounded border text-center ${dnsSec?.hasSpf ? 'bg-green-900/10 border-green-500 text-green-400' : 'bg-red-900/10 border-red-500 text-red-400'}`}>
                        <div className="font-bold">SPF</div>
                        <div className="text-[9px]">{dnsSec?.hasSpf ? 'ENFORCED' : 'MISSING'}</div>
                     </div>
                     <div className={`flex-1 p-2 rounded border text-center ${dnsSec?.hasDmarc ? 'bg-green-900/10 border-green-500 text-green-400' : 'bg-red-900/10 border-red-500 text-red-400'}`}>
                        <div className="font-bold">DMARC</div>
                        <div className="text-[9px]">{dnsSec?.hasDmarc ? 'REJECT' : 'NONE'}</div>
                     </div>
                     <div className={`flex-1 p-2 rounded border text-center ${selected.ssl === 'Valid' ? 'bg-green-900/10 border-green-500 text-green-400' : 'bg-orange-900/10 border-orange-500 text-orange-400'}`}>
                        <div className="font-bold">SSL</div>
                        <div className="text-[9px]">{selected.ssl}</div>
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="p-0 overflow-hidden flex flex-col">
               <CardHeader title="Typosquatting Monitor" action={<Badge color="orange">{squats.length} Variants</Badge>} />
               <div className="p-4 grid grid-cols-2 gap-2 bg-slate-900/50">
                  {squats.map(s => (
                     <div key={s} className="flex justify-between items-center p-2 bg-slate-950 border border-slate-800 rounded">
                        <span className="text-xs font-mono text-slate-300">{s}</span>
                        <Badge color="slate">Available</Badge>
                     </div>
                  ))}
               </div>
            </Card>

            <Card className="flex-1 p-0 overflow-hidden flex flex-col">
               <CardHeader title="Subdomain Enumeration" />
               <div className="p-4 flex-1 bg-slate-900/50">
                  <div className="flex flex-wrap gap-2">
                     {selected.subdomains.map(sub => (
                        <span key={sub} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 text-xs font-mono hover:border-cyan-500 transition-colors cursor-default">
                           {sub}{selected.domain}
                        </span>
                     ))}
                  </div>
               </div>
            </Card>
         </div>
      </div>
    );
  }
};
