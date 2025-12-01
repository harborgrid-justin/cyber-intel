
import React, { useMemo, useState } from 'react';
import { Card, Badge, ProgressBar, FilterGroup, Grid, Button, CardHeader } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { threatData } from '../../services/dataLayer';
import { DefenseLogic } from '../../services/logic/DefenseLogic';
import { StandardPage } from '../Shared/Layouts';
import { MOCK_VENDORS } from '../../constants';
import { Vendor } from '../../types';
import ResponsiveTable from '../Shared/ResponsiveTable';

const SupplyChainMonitor: React.FC = () => {
  const [activeModule, setActiveModule] = useState('RISK_RADAR');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  const riskData = useMemo(() => {
    const vulns = threatData.getVulnerabilities();
    const campaigns = threatData.getCampaigns();
    const actors = threatData.getActors();
    return MOCK_VENDORS.map(v => DefenseLogic.calculateVendorRisk(v, vulns, campaigns, actors))
                      .sort((a, b) => b.riskScore - a.riskScore);
  }, []);

  const selectedVendor = riskData.find(v => v.id === selectedVendorId) || riskData[0];

  const MODULES = [
    { label: 'Risk Radar', value: 'RISK_RADAR', icon: <Icons.Activity className="w-3 h-3" /> },
    { label: 'Vendor Inventory', value: 'INVENTORY', icon: <Icons.Users className="w-3 h-3" /> },
    { label: 'SBOM Inspector', value: 'SBOM', icon: <Icons.FileText className="w-3 h-3" /> },
    { label: 'N-Tier Graph', value: 'GRAPH', icon: <Icons.Layers className="w-3 h-3" /> },
    { label: 'Access Gov', value: 'ACCESS', icon: <Icons.Key className="w-3 h-3" /> },
    { label: 'Compliance', value: 'COMPLIANCE', icon: <Icons.CheckCircle className="w-3 h-3" /> },
    { label: 'Geopolitics', value: 'GEO', icon: <Icons.Globe className="w-3 h-3" /> },
    { label: 'Incidents', value: 'INCIDENTS', icon: <Icons.AlertTriangle className="w-3 h-3" /> },
  ];

  return (
    <StandardPage title="Third-Party Risk Operations" subtitle="Supply Chain Risk Management (SCRM)" modules={[]} activeModule="" onModuleChange={() => {}}>
      <div className="flex flex-col gap-6 h-full">
        <div className="bg-slate-900 border-b border-slate-800 pb-0 shrink-0">
           <FilterGroup value={activeModule} onChange={setActiveModule} options={MODULES} />
        </div>

        {activeModule === 'RISK_RADAR' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <Card className="lg:col-span-2 p-0 overflow-hidden">
                <CardHeader 
                  title="Critical Vendor Watchlist" 
                  action={
                    <div className="flex gap-2">
                      <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>High Risk</span>
                      <span className="text-[10px] text-green-500 font-bold flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span>Stable</span>
                    </div>
                  }
                />
                <div className="divide-y divide-slate-800">
                   {riskData.map((v, i) => (
                     <div key={v.id} className="p-4 flex items-center gap-4 hover:bg-slate-900/50 transition-colors group cursor-pointer" onClick={() => setSelectedVendorId(v.id)}>
                        <div className="text-sm font-mono text-slate-600 w-6">0{i+1}</div>
                        <div className="flex-1">
                           <div className="flex justify-between mb-1">
                              <span className="font-bold text-white text-base">{v.name}</span>
                              <span className={`font-mono font-bold ${v.riskScore > 80 ? 'text-red-500' : 'text-green-500'}`}>{v.riskScore}/100</span>
                           </div>
                           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                              <div className={`h-full ${v.riskScore > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${v.riskScore}%` }}></div>
                           </div>
                           <div className="flex gap-4 text-[10px] text-slate-500 uppercase font-bold">
                              <span>{v.tier}</span>
                              <span>{v.category}</span>
                              <span className={v.hqLocation === 'Russia' ? 'text-red-400' : ''}>{v.hqLocation}</span>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </Card>
             <div className="space-y-4">
                <Card className="p-6 border-l-4 border-l-red-600">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest">Aggregate Exposure</h3>
                      <Icons.Activity className="w-5 h-5 text-red-500" />
                   </div>
                   <div className="text-4xl font-mono font-bold text-white mb-2">CRITICAL</div>
                   <p className="text-xs text-slate-400">3 Strategic vendors have active zero-day vulnerabilities affecting internal systems.</p>
                </Card>
                <Card className="p-4">
                   <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Top Vulnerable Software</h3>
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-300"><span>Log4j (SolarWinds)</span><span className="text-red-500 font-bold">CVE-2021-44228</span></div>
                      <div className="flex justify-between text-xs text-slate-300"><span>OpenSSL (Azure)</span><span className="text-orange-500 font-bold">CVE-2023-0286</span></div>
                   </div>
                </Card>
             </div>
          </div>
        )}

        {activeModule === 'INVENTORY' && (
           <ResponsiveTable<Vendor> 
              data={riskData} 
              keyExtractor={v => v.id}
              columns={[
                 { header: 'Vendor', render: v => <span className="font-bold text-white">{v.name}</span> },
                 { header: 'Product', render: v => <span className="text-slate-400 text-xs">{v.product}</span> },
                 { header: 'Category', render: v => <Badge color="slate">{v.category}</Badge> },
                 { header: 'Tier', render: v => <Badge color={v.tier === 'Strategic' ? 'purple' : 'blue'}>{v.tier}</Badge> },
                 { header: 'Headquarters', render: v => <span className="text-xs text-slate-300 flex items-center gap-2"><Icons.Globe className="w-3 h-3 text-slate-500" />{v.hqLocation}</span> },
                 { header: 'Risk', render: v => <span className={`font-bold ${v.riskScore > 80 ? 'text-red-500' : 'text-green-500'}`}>{v.riskScore}</span> }
              ]}
              renderMobileCard={v => <div>{v.name}</div>}
           />
        )}

        {activeModule === 'SBOM' && (
           <div className="flex h-full gap-6">
              <div className="w-64 space-y-2 shrink-0">
                 {riskData.map(v => (
                    <div key={v.id} onClick={() => setSelectedVendorId(v.id)} className={`p-3 rounded cursor-pointer border ${selectedVendor.id === v.id ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>
                       <div className="font-bold text-sm">{v.name}</div>
                       <div className="text-[10px] uppercase">{v.product}</div>
                    </div>
                 ))}
              </div>
              <Card className="flex-1 p-0 overflow-hidden flex flex-col">
                 <CardHeader title={`Software Bill of Materials: ${selectedVendor.product}`} />
                 <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {selectedVendor.sbom.length > 0 ? selectedVendor.sbom.map((comp, i) => (
                       <div key={i} className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded hover:border-slate-600">
                          <div className="flex items-center gap-3">
                             <Icons.Box className="w-4 h-4 text-slate-500" />
                             <div>
                                <div className="text-sm font-mono text-cyan-400 font-bold">{comp.name}</div>
                                <div className="text-[10px] text-slate-500">v{comp.version} • {comp.license}</div>
                             </div>
                          </div>
                          {comp.critical ? (
                             <Badge color="red">CRITICAL VULN FOUND</Badge>
                          ) : (
                             <Badge color="green">SECURE</Badge>
                          )}
                       </div>
                    )) : <div className="text-center py-12 text-slate-500 italic">No SBOM data available for this vendor.</div>}
                 </div>
              </Card>
           </div>
        )}

        {/* ... (Other modules kept simple for brevity but would follow same pattern) ... */}
        {activeModule === 'GRAPH' && (
           <div className="h-full bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-4 left-4 z-10 bg-slate-900/80 p-2 rounded border border-slate-700">
                 <div className="text-[10px] font-bold text-slate-400 uppercase">Supply Chain Depth</div>
                 <div className="text-lg font-bold text-white">Tier 1 → Tier 4</div>
              </div>
              <svg className="w-full h-full absolute inset-0">
                 <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="#334155" strokeWidth="1" />
                 <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="#334155" strokeWidth="1" />
                 <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#334155" strokeWidth="1" />
                 <circle cx="50%" cy="50%" r="30" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
                 <text x="50%" y="50%" dy="5" textAnchor="middle" fill="#06b6d4" fontSize="10" fontWeight="bold">SENTINEL</text>
                 {riskData.map((v, i) => {
                    const angle = (i / riskData.length) * 2 * Math.PI;
                    const x = 50 + 30 * Math.cos(angle);
                    const y = 50 + 30 * Math.sin(angle);
                    return (
                       <g key={v.id}>
                          <circle cx={`${x}%`} cy={`${y}%`} r="15" fill="#1e293b" stroke={v.riskScore > 80 ? '#ef4444' : '#22c55e'} strokeWidth="2" />
                          <text x={`${x}%`} y={`${y}%`} dy="20" textAnchor="middle" fill="#94a3b8" fontSize="8">{v.name}</text>
                       </g>
                    );
                 })}
              </svg>
           </div>
        )}
        
        {activeModule === 'ACCESS' && <Grid cols={3}>{riskData.filter(v=>v.access.length>0).map(v=><Card key={v.id} className="p-4 flex flex-col gap-3"><div className="flex justify-between"><h3 className="font-bold text-white">{v.name}</h3><Badge color="red">PRIVILEGED</Badge></div><div className="space-y-2">{v.access.map((acc,i)=><div key={i} className="bg-slate-950 p-2 rounded border border-slate-800 text-xs flex justify-between items-center"><span className="text-slate-300 font-mono">{acc.systemId}</span><span className="text-cyan-500 font-bold">{acc.accessLevel}</span></div>)}</div><Button variant="outline" className="text-[10px] mt-2">REVOKE ACCESS</Button></Card>)}</Grid>}
        {activeModule === 'COMPLIANCE' && <div className="space-y-4">{riskData.map(v=><div key={v.id} className="bg-slate-900 border border-slate-800 p-4 rounded flex items-center justify-between"><div className="w-48 font-bold text-white">{v.name}</div><div className="flex-1 flex gap-4">{v.compliance.map((c,i)=><div key={i} className={`flex items-center gap-2 px-3 py-1 rounded border text-xs ${c.status==='VALID'?'bg-green-900/10 border-green-900 text-green-400':c.status==='EXPIRED'?'bg-red-900/10 border-red-900 text-red-400':'bg-yellow-900/10 border-yellow-900 text-yellow-400'}`}>{c.status==='VALID'?<Icons.CheckCircle className="w-3 h-3"/>:<Icons.AlertTriangle className="w-3 h-3"/>}<span className="font-bold">{c.standard}</span><span className="opacity-50">exp: {c.expiry}</span></div>)}</div><Button variant="text" className="text-xs text-cyan-500">REQUEST AUDIT</Button></div>)}</div>}
        {activeModule === 'GEO' && <Card className="h-full p-6 relative overflow-hidden"><div className="absolute top-6 left-6 z-10"><h3 className="font-bold text-white uppercase tracking-widest text-sm">Vendor Jurisdiction Map</h3></div><div className="w-full h-full flex items-center justify-center text-slate-600"><div className="grid grid-cols-2 gap-12 text-center"><div className="p-8 border-2 border-slate-800 rounded-xl"><div className="text-4xl font-bold text-white mb-2">{riskData.filter(v=>v.hqLocation==='USA').length}</div><div className="text-xs font-bold text-green-500 uppercase">NATO / Friendly</div></div><div className="p-8 border-2 border-red-900/30 bg-red-900/5 rounded-xl"><div className="text-4xl font-bold text-red-500 mb-2">{riskData.filter(v=>['Russia','China'].includes(v.hqLocation)).length}</div><div className="text-xs font-bold text-red-400 uppercase">Sanctioned / High Risk</div></div></div></div></Card>}
        {activeModule === 'INCIDENTS' && <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 py-4"><div className="pl-8 relative"><div className="absolute left-[-9px] top-1.5 w-4 h-4 bg-slate-900 border-2 border-red-500 rounded-full"></div><div className="text-sm font-bold text-white">SolarWinds Orion Compromise</div><div className="text-xs text-slate-500">Dec 2020 • Supply Chain Attack • Global Impact</div></div><div className="pl-8 relative"><div className="absolute left-[-9px] top-1.5 w-4 h-4 bg-slate-900 border-2 border-orange-500 rounded-full"></div><div className="text-sm font-bold text-white">Log4Shell Disclosure</div><div className="text-xs text-slate-500">Dec 2021 • Critical Vulnerability • Affects 40% of vendors</div></div></div>}
      </div>
    </StandardPage>
  );
};
export default SupplyChainMonitor;
