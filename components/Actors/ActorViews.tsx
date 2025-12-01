
import React from 'react';
import { Threat, ThreatActor } from '../../types';
import { Badge, Card, Button, Input, CardHeader } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import FeedItem from '../Feed/FeedItem';
import { ActorAliases } from './Views/ActorEditComponents';

interface ActionsProps {
  newThreatId: string;
  setThreatId: (id: string) => void;
  linkThreat: () => void;
  updateOrigin: (origin: string) => void;
  addAlias: () => void;
  newAlias: string;
  setAlias: (alias: string) => void;
}

interface TimelineEventInput { date: string; title: string; description: string; }

export const ActorTimeline: React.FC<{
  history: any[];
  onAdd: () => void;
  newEvent: TimelineEventInput;
  setNewEvent: (e: TimelineEventInput) => void;
}> = ({ history, onAdd, newEvent, setNewEvent }) => {
  const sortedHistory = [...(history || [])].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden bg-slate-900 border border-slate-800">
         <CardHeader title="Add Event" />
         <div className="p-4">
            <div className="flex gap-2 mb-2"><Input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} /><Input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="Event Title" className="flex-1" /></div>
            <div className="flex gap-2"><Input value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Description" className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
         </div>
      </Card>
      
      <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 pb-4">
        {sortedHistory.length > 0 ? sortedHistory.map((e: any, i: number) => (
          <div key={i} className="pl-8 relative">
             <div className="absolute left-[-9px] top-1 w-4 h-4 bg-slate-950 border-2 border-cyan-600 rounded-full"></div>
             <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
               <span className="text-xs text-cyan-500 font-bold font-mono bg-cyan-900/10 px-2 py-0.5 rounded border border-cyan-900/30">{e.date}</span>
               <h4 className="text-white font-bold text-sm">{e.title}</h4>
             </div>
             <p className="text-slate-400 text-xs leading-relaxed">{e.description}</p>
          </div>
        )) : <div className="text-slate-500 text-sm pl-8 italic">No timeline events recorded.</div>}
      </div>
    </div>
  );
};

export const ActorAssociations = () => (
  <Card className="p-0 overflow-hidden">
    <CardHeader title="Known Associates" />
    <ResponsiveTable data={[{n:'Lazarus', r:'Co-Op'}, {n:'BlackCat', r:'Affiliate'}]} keyExtractor={(i: any) => i.n} columns={[{header:'Group', render:(i:any)=><span className="text-white">{i.n}</span>}, {header:'Relation', render:(i:any)=><Badge>{i.r}</Badge>}]} renderMobileCard={(i:any) => <div>{i.n}</div>} />
  </Card>
);

export const ActorProfile: React.FC<{
  actor: ThreatActor;
  actions: ActionsProps;
  linkedThreats: Threat[];
}> = ({ actor, actions, linkedThreats }) => (
  <div className="space-y-6">
    <Card className="p-0 overflow-hidden border-l-4 border-l-cyan-500">
        <CardHeader title="Description" />
        <div className="p-4"><p className="text-sm text-slate-200">{actor.description}</p></div>
    </Card>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-0 overflow-hidden">
            <CardHeader title="Demographics" />
            <div className="p-4 space-y-4">
                <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1">Origin</label>
                    <input className="bg-transparent text-white font-bold w-full border-b border-slate-700 pb-1 focus:border-cyan-500 focus:outline-none" value={actor.origin} onChange={(e) => actions.updateOrigin(e.target.value)} />
                </div>
                <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-1">Sophistication</label>
                    <div className="text-white font-bold">{actor.sophistication}</div>
                </div>
            </div>
        </Card>
        <Card className="p-0 overflow-hidden">
            <CardHeader title="Aliases" />
            <div className="p-4"><ActorAliases aliases={actor.aliases} onAdd={actions.addAlias} newVal={actions.newAlias} setVal={actions.setAlias} /></div>
        </Card>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-0 overflow-hidden">
        <CardHeader title="Known Exploits" />
        <div className="p-4 flex flex-wrap gap-2">
            {actor.exploits && actor.exploits.length > 0 ? actor.exploits.map((exploit: string, i: number) => (
                <a key={i} href={`https://nvd.nist.gov/vuln/detail/${exploit}`} target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-950 text-orange-400 text-[10px] font-mono rounded border border-orange-900/30 hover:border-orange-500 transition-colors flex items-center gap-1 group">
                    {exploit} <span className="opacity-50 group-hover:opacity-100">↗</span>
                </a>
            )) : <span className="text-xs text-slate-500 italic">No exploits recorded.</span>}
        </div>
      </Card>
      <Card className="p-0 overflow-hidden">
        <CardHeader title="OSINT References" />
        <div className="p-4 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {actor.references && actor.references.length > 0 ? actor.references.map((ref: string, i: number) => (
                <div key={i} className="flex items-center gap-2 overflow-hidden">
                    <span className="w-1 h-1 rounded-full bg-cyan-500 shrink-0"></span>
                    <a href={ref} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-400 hover:text-cyan-300 truncate font-mono">{ref}</a>
                </div>
            )) : <span className="text-xs text-slate-500 italic">No references available.</span>}
        </div>
      </Card>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-0 overflow-hidden">
            <CardHeader title="Infrastructure Details" />
            <div className="p-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {actor.infrastructure && actor.infrastructure.length > 0 ? actor.infrastructure.map((infra: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800">
                        <div className="flex flex-col"><span className="font-mono text-sm text-cyan-400">{infra.value}</span><span className="text-[10px] text-slate-500">{infra.type}</span></div>
                        <Badge color={infra.status === 'ACTIVE' ? 'red' : 'green'}>{infra.status}</Badge>
                    </div>
                )) : <span className="text-xs text-slate-500 italic">No infrastructure recorded.</span>}
            </div>
        </Card>
        <Card className="p-0 overflow-hidden">
            <CardHeader title="Linked Threats" />
            <div className="p-4 flex flex-col h-full">
                <div className="flex gap-2 mb-4 shrink-0"><Input value={actions.newThreatId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => actions.setThreatId(e.target.value)} placeholder="Threat ID" className="flex-1" /><Button onClick={actions.linkThreat}>LINK</Button></div>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar flex-1">{linkedThreats.slice(0,5).map((t: any) => <FeedItem key={t.id} threat={t} />)}</div>
            </div>
        </Card>
    </div>
  </div>
);
