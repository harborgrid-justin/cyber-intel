


import React, { useState } from 'react';
// Fix: Import UI components from the barrel file
import { Card, Button, Input, Badge, CardHeader, DataField } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { OsintLogic } from '../../../services/logic/OsintLogic';
import { Icons } from '../../Shared/Icons';
// Fix: Import types from the central types file
import { OsintDomain, GlobalSearchResult, DomainAnalysis } from '../../../types';
import { useDebounce } from '../../../hooks/useDebounce'; // Hook import

export const SearchViews = {
  CentralSearch: () => {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500); // 500ms delay
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    
    // Auto-search effect on debounce
    React.useEffect(() => {
        if (debouncedQuery.length > 2) {
            handleSearch(debouncedQuery);
        } else {
            setResults([]);
        }
    }, [debouncedQuery]);

    const handleSearch = async (q: string) => {
      setSearching(true);
      const res = await OsintLogic.globalSearch(q);
      setResults(res);
      setSearching(false);
    };

    return (
      <div className="flex flex-col h-full gap-6">
        <Card className="p-0 overflow-hidden shrink-0">
            <CardHeader title="Intelligence Search Engine" />
            <div className="p-6">
                <div className="flex gap-4">
                    <Input 
                        className="flex-1 text-lg" 
                        placeholder="Search IOCs, emails, domains, handles..." 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button variant="primary" onClick={() => handleSearch(query)} disabled={searching} className="px-8">
                        {searching ? '...' : 'SEARCH'}
                    </Button>
                </div>
            </div>
        </Card>
        {/* ... Rest of JSX same as before ... */}
        {results.length > 0 ? (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 gap-4">
             {results.map((r, i) => (
               <Card key={i} className="p-4 hover:border-cyan-500 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                       <Badge color="blue">{r.type}</Badge>
                       <span className="font-bold text-white text-lg">
                         {r.val.indicator || r.val.domain || r.val.email || r.val.handle || r.val.ip || r.val.name || r.val.title}
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
             <div className="text-sm font-bold uppercase tracking-widest">{searching ? 'Searching Global Index...' : 'No Results Found'}</div>
          </div>
        )}
      </div>
    );
  },
  // ... Other views unchanged ...
  DomainIntel: () => {
    const domains = useDataStore(() => threatData.getOsintDomains());
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selected = domains.find(d => d.domain === selectedId) || domains[0];
    const [analysis, setAnalysis] = useState<any>(null);

    React.useEffect(() => {
        if (selected) {
            OsintLogic.analyzeDomain(selected).then(setAnalysis);
        }
    }, [selected]);

    if (!analysis) return <div className="p-12 text-center text-slate-500">Loading Analysis...</div>;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
         <Card className="lg:col-span-1 p-0 overflow-hidden flex flex-col">
            <CardHeader title="Monitored Domains" />
            <div className="flex-1 overflow-y-auto">
               <ResponsiveTable<OsintDomain> 
                 data={domains} 
                 keyExtractor={d => d.domain}
                 columns={[
                   { header: 'Domain', render: d => <div onClick={() => setSelectedId(d.domain)} className="cursor-pointer font-bold text-white hover:text-cyan-400">{d.domain}</div> },
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
                        <div className="flex gap-4 text-xs text-slate-400 font-mono">
                            <span>REG: {selected.registrar}</span><span>CREATED: {selected.created}</span>
                        </div>
                    </div>
                    <div className="text-right"><DataField label="Registrar Risk" value={`${analysis.registrarRisk}/100`} className={`text-right ${analysis.registrarRisk > 50 ? 'text-red-500' : 'text-green-500'}`} /></div>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-800 mb-4">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-3">DNS Security Matrix</div>
                    <div className="flex gap-4">
                        <div className={`flex-1 p-2 rounded border text-center ${analysis.dnsSecurity.hasSpf ? 'bg-green-900/10 border-green-500 text-green-400' : 'bg-red-900/10 border-red-500 text-red-400'}`}><div className="font-bold">SPF</div><div className="text-[9px]">{analysis.dnsSecurity.hasSpf ? 'ENFORCED' : 'MISSING'}</div></div>
                        <div className={`flex-1 p-2 rounded border text-center ${analysis.dnsSecurity.hasDmarc ? 'bg-green-900/10 border-green-500 text-green-400' : 'bg-red-900/10 border-red-500 text-red-400'}`}><div className="font-bold">DMARC</div><div className="text-[9px]">{analysis.dnsSecurity.hasDmarc ? 'REJECT' : 'NONE'}</div></div>
                        <div className={`flex-1 p-2 rounded border text-center ${selected.ssl === 'Valid' ? 'bg-green-900/10 border-green-500 text-green-400' : 'bg-orange-900/10 border-orange-500 text-orange-400'}`}><div className="font-bold">SSL</div><div className="text-[9px]">{selected.ssl}</div></div>
                    </div>
                </div>
             </Card>
             <Card className="p-0 overflow-hidden flex flex-col">
                <CardHeader title="Typosquatting Monitor" action={<Badge color="orange">{analysis.typosquats.length} Variants</Badge>} />
                <div className="p-4 grid grid-cols-2 gap-2 bg-slate-900/50">
                    {analysis.typosquats.map((s: string) => <div key={s} className="flex justify-between items-center p-2 bg-slate-950 border border-slate-800 rounded"><span className="text-xs font-mono text-slate-300">{s}</span><Badge color="slate">Available</Badge></div>)}
                </div>
             </Card>
         </div>
      </div>
    );
  }
};