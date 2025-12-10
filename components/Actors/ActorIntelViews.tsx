
import React from 'react';
import { Threat, ThreatActor, Malware, Infrastructure, Pcap } from '../../types';
import { Badge, Card, Button, CardHeader, Input } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import FeedItem from '../Feed/FeedItem';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';

// --- Sub-Components ---

export const ActorThreatFeeds = ({ actorName }: { actorName: string }) => {
  const allFeeds = useDataStore(() => threatData.getFeeds());
  
  // Transform feeds into a display format relative to the actor
  // In a real scenario, this would check if the feed contains specific actor data
  const feeds = allFeeds.slice(0, 3).map(f => ({
      name: f.name,
      status: f.status,
      confidence: f.type === 'STIX/TAXII' ? 'High' : 'Medium',
      lastHit: f.lastSync
  }));

  return (
    <div className="grid grid-cols-1 gap-3">
        {feeds.map((f, i) => (
          <div key={i} className="p-3 border border-slate-800 bg-slate-900 rounded flex justify-between items-center">
            <div><div className="font-bold text-white text-xs">{f.name}</div><div className="text-[10px] text-slate-500">Hit: {f.lastHit}</div></div>
            <Badge color="blue">{f.confidence}</Badge>
          </div>
        ))}
        {feeds.length === 0 && <div className="text-slate-500 text-xs text-center py-2">No active feeds linked.</div>}
    </div>
  );
};

export const ActorIoCAssociations = ({ threats }: { threats: Threat[] }) => (
    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
      {threats.length > 0 ? threats.map(t => <FeedItem key={t.id} threat={t} />) : <div className="text-center text-slate-500 italic py-8 border-2 border-dashed border-slate-800 rounded">No IoCs currently linked.</div>}
    </div>
);

export const ActorMalwareFamilies = ({ malware }: { malware: Malware[] }) => (
    <div className="grid grid-cols-1 gap-3">
        {malware.length === 0 ? <div className="text-center text-slate-500 italic text-xs py-4">No malware linked.</div> : 
        malware.map(m => (
            <div key={m.id} className="p-3 border border-slate-800 bg-slate-950 rounded flex justify-between items-center group hover:border-red-900/50 transition-colors">
                <div>
                    <div className="text-white font-bold text-xs">{m.name}</div>
                    <div className="text-[10px] text-red-400">{m.family}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <Badge color="red">MALICIOUS</Badge>
                    <span className="text-[9px] text-slate-600 font-mono truncate max-w-[80px]">{m.hash}</span>
                </div>
            </div>
        ))}
    </div>
);

export const ActorNetworkAnalysis = ({ pcaps }: { pcaps: Pcap[] }) => (
    <div className="space-y-2">
        {pcaps.length > 0 ? pcaps.map(p => (
        <div key={p.id} className="bg-slate-900 border border-slate-800 p-3 rounded flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-700">PCAP</div>
                <div><div className="font-bold text-white font-mono text-xs">{p.name}</div><div className="text-[10px] text-slate-500">{p.size}</div></div>
            </div>
            <Badge color={p.analysisStatus === 'ANALYZED' ? 'green' : 'orange'}>{p.analysisStatus}</Badge>
        </div>
        )) : <div className="text-slate-500 text-center py-4 italic text-xs">No captures linked.</div>}
    </div>
);

// --- Consolidated View ---

interface IntelligenceViewProps {
    actor: ThreatActor;
    linkedThreats: Threat[];
    malware: Malware[];
    pcaps: Pcap[];
    actions: any;
    state: any;
    setters: any;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({ 
    actor, linkedThreats, malware, pcaps, actions, state, setters 
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Col: Sources & Malware */}
            <div className="flex flex-col gap-6">
                <Card className="p-0 overflow-hidden">
                    <CardHeader title="Intel Sources" />
                    <div className="p-4">
                        <ActorThreatFeeds actorName={actor.name} />
                    </div>
                </Card>
                <Card className="p-0 overflow-hidden flex-1 border-l-4 border-l-red-600">
                    <CardHeader title="Malware Arsenal" />
                    <div className="p-4 overflow-y-auto">
                        <ActorMalwareFamilies malware={malware} />
                    </div>
                </Card>
            </div>

            {/* Center Col: IoCs */}
            <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
                <CardHeader 
                    title="Indicators of Compromise" 
                    action={<Badge color="red">{linkedThreats.length} Active IoCs</Badge>}
                />
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-2">
                    <Input 
                        value={state.newThreatId} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setters.setNewThreatId(e.target.value)} 
                        placeholder="Link existing Threat ID..." 
                        className="flex-1 text-xs" 
                    />
                    <Button onClick={actions.linkThreat} variant="secondary" className="text-xs">LINK</Button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar bg-slate-900/20">
                    <ActorIoCAssociations threats={linkedThreats} />
                </div>
                
                {/* Bottom Section inside IoC card for Network Analysis */}
                <div className="border-t border-slate-800">
                    <CardHeader title="Network Forensics" className="bg-slate-950/50" action={<span className="text-[10px] text-slate-500">{pcaps.length} FILES</span>} />
                    <div className="p-4 bg-slate-900/10">
                        <ActorNetworkAnalysis pcaps={pcaps} />
                    </div>
                </div>
            </Card>
        </div>
    );
};
