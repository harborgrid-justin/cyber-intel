


import React, { useState, useEffect } from 'react';
// Fix: Import UI components from the barrel file
import { Card, Badge, Grid, CardHeader } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { OsintLogic } from '../../../services/logic/OsintLogic';
import { Icons } from '../../Shared/Icons';
// Fix: Import types from the central types file
import { OsintGeo, OsintFileMeta, OsintDarkWebItem, NetworkAnalysis, DarkWebAnalysis } from '../../../types';
import { DarkWebTerminal } from '../DarkWebTerminal';

interface EnrichedGeo extends OsintGeo, NetworkAnalysis {}
type EnrichedDarkWeb = OsintDarkWebItem & DarkWebAnalysis;

export const InfrastructureViews = {
  IpGeolocation: () => {
    // Efficient Subscription
    const ips = useDataStore(() => threatData.getOsintGeo());
    
    const [enriched, setEnriched] = useState<EnrichedGeo[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await Promise.all(ips.map(async i => {
                const analysis = await OsintLogic.analyzeNetwork(i);
                return { ...i, ...analysis };
            }));
            setEnriched(data);
        };
        load();
    }, [ips]);

    return (
      <Card className="flex-1 p-0 overflow-hidden flex flex-col h-full">
         <CardHeader title="Network Infrastructure Analysis" />
         <div className="flex-1 overflow-y-auto">
            {/* Fix: The generic type for ResponsiveTable needs an 'id' property. EnrichedGeo has it from OsintGeo. */}
            <ResponsiveTable<EnrichedGeo> 
               data={enriched} 
               keyExtractor={i => i.ip}
               columns={[
                  { header: 'IP Address', render: i => <span className="font-mono text-white font-bold">{i.ip}</span> },
                  { header: 'Location', render: i => <span className="text-slate-300">{i.city}, {i.country}</span> },
                  { header: 'Network (ASN)', render: i => <div className="text-xs"><div className="text-white">{i.isp}</div><Badge color="slate">{i.classification}</Badge></div> },
                  { header: 'Context', render: i => <Badge color={i.isProxy ? 'orange' : 'slate'}>{i.threatContext}</Badge> },
                  { header: 'Open Ports', render: i => 
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-cyan-500">{i.ports.join(', ')}</span>
                        <div className="text-[9px] text-red-400">Risk: {i.portRisk}</div>
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
    // Efficient Subscription
    const files = useDataStore(() => threatData.getOsintMeta());
    
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
    // Efficient Subscription
    const items = useDataStore(() => threatData.getOsintDarkWeb());
    const [enriched, setEnriched] = useState<EnrichedDarkWeb[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await Promise.all(items.map(async item => {
                const analysis = await OsintLogic.analyzeDarkWeb(item);
                return { ...item, ...analysis };
            }));
            setEnriched(data);
        };
        load();
    }, [items]);

    return (
      <div className="flex flex-col lg:flex-row gap-6 h-full">
         <div className="flex-1 overflow-y-auto custom-scrollbar">
            <Grid cols={1}>
                {enriched.map((item, i) => (
                    <Card key={i} className={`p-4 border-l-4 ${item.severity === 'CRITICAL' ? 'border-l-red-600 bg-red-900/10' : item.severity === 'HIGH' ? 'border-l-orange-500' : 'border-l-slate-600'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">{item.source}</span>
                            <div className="flex gap-2">
                                {item.trend === 'UP' && <Badge color="red">Price ↑</Badge>}
                                <Badge color={item.severity === 'CRITICAL' ? 'red' : item.severity === 'HIGH' ? 'orange' : 'slate'}>{item.severity}</Badge>
                            </div>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
                        <div className="flex justify-between items-center text-xs text-slate-400 mt-4 border-t border-slate-800/50 pt-2">
                            <span>Posted by: <span className="text-cyan-500">{item.author}</span></span>
                            <span className="font-mono text-green-400">{item.price}</span>
                        </div>
                    </Card>
                ))}
            </Grid>
         </div>
         <div className="lg:w-1/3 min-h-[300px] flex flex-col">
            <DarkWebTerminal />
         </div>
      </div>
    );
  }
};