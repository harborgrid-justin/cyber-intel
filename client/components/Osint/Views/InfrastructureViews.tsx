
import React from 'react';
import { Card, Badge, Grid, CardHeader } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { threatData } from '../../../services-frontend/dataLayer';
import { OsintLogic } from '../../../services-frontend/logic/OsintLogic';
import { Icons } from '../../Shared/Icons';
import { OsintGeo, OsintFileMeta, OsintDarkWebItem } from '../../../types';

export const InfrastructureViews = {
  IpGeolocation: () => {
    const ips = threatData.getOsintGeo();
    return (
      <Card className="flex-1 p-0 overflow-hidden flex flex-col h-full">
         <CardHeader title="Network Infrastructure Analysis" />
         <div className="flex-1 overflow-y-auto">
            <ResponsiveTable<OsintGeo> 
               data={ips} 
               keyExtractor={i => i.ip}
               columns={[
                  { header: 'IP Address', render: i => <span className="font-mono text-white font-bold">{i.ip}</span> },
                  { header: 'Location', render: i => <span className="text-slate-300">{i.city}, {i.country}</span> },
                  { header: 'Network (ASN)', render: i => <div className="text-xs"><div className="text-white">{i.isp}</div><Badge color="slate">{OsintLogic.Network.classifyISP(i.isp)}</Badge></div> },
                  { header: 'Context', render: i => <Badge color={OsintLogic.isProxyOrVpn(i) ? 'orange' : 'slate'}>{OsintLogic.getThreatContext(i)}</Badge> },
                  { header: 'Open Ports', render: i => 
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-cyan-500">{i.ports.join(', ')}</span>
                        <div className="text-[9px] text-red-400">Risk: {OsintLogic.Network.calculatePortRisk(i.ports)}</div>
                    </div> 
                  }
               ]}
               renderMobileCard={i => <div>{i.ip}</div>}
            />
         </div>
      </Card>
    );
  },

  Metadata: () => {
    const files = threatData.getOsintMeta();
    return (
      <div className="space-y-6">
         <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 flex flex-col items-center justify-center text-slate-500 hover:border-cyan-500 hover:text-cyan-500 transition-colors cursor-pointer bg-slate-900/50">
            <Icons.FileText className="w-12 h-12 mb-4" />
            <div className="text-sm font-bold uppercase tracking-widest">Drop Files for EXIF Extraction</div>
            <div className="text-xs mt-2">Supports PDF, JPG, DOCX, PNG</div>
         </div>

         <Card className="p-0 overflow-hidden">
            <CardHeader title="Extracted Metadata" />
            <ResponsiveTable<OsintFileMeta> 
               data={files} 
               keyExtractor={f => f.name}
               columns={[
                  { header: 'File Name', render: f => <span className="text-white font-bold">{f.name}</span> },
                  { header: 'Size', render: f => <span className="font-mono text-xs text-slate-400">{f.size}</span> },
                  { header: 'Type', render: f => <Badge color="slate">{f.type}</Badge> },
                  { header: 'Author', render: f => <span className="text-cyan-400 text-xs">{f.author}</span> },
                  { header: 'GPS/Location', render: f => <span className="font-mono text-xs text-yellow-500">{f.gps}</span> },
                  { header: 'Entropy', render: f => <span className="text-[10px] text-slate-500">{OsintLogic.analyzeFileEntropy(parseFloat(f.size), f.type)}</span> }
               ]}
               renderMobileCard={f => <div>{f.name}</div>}
            />
         </Card>
      </div>
    );
  },

  DarkWeb: () => {
    const items = threatData.getOsintDarkWeb();
    return (
      <Grid cols={2}>
         {items.map((item, i) => {
            const severity = OsintLogic.calculateLeakSeverity(item);
            const market = OsintLogic.Network.analyzeDarkWebInflation(item);
            return (
               <Card key={i} className={`p-4 border-l-4 ${severity === 'CRITICAL' ? 'border-l-red-600 bg-red-900/10' : severity === 'HIGH' ? 'border-l-orange-500' : 'border-l-slate-600'}`}>
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">{item.source}</span>
                     <div className="flex gap-2">
                        {market.trend === 'UP' && <Badge color="red">Price ↑</Badge>}
                        <Badge color={severity === 'CRITICAL' ? 'red' : severity === 'HIGH' ? 'orange' : 'slate'}>{severity}</Badge>
                     </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
                  <div className="flex justify-between items-center text-xs text-slate-400 mt-4 border-t border-slate-800/50 pt-2">
                     <span>Posted by: <span className="text-cyan-500">{item.author}</span></span>
                     <span className="font-mono text-green-400">{item.price}</span>
                  </div>
               </Card>
            );
         })}
      </Grid>
    );
  }
};
