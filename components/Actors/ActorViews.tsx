
import React from 'react';
import { Threat, ThreatActor, Infrastructure, View } from '../../types';
import { Badge, Card, Button, Input } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import FeedItem from '../Feed/FeedItem';
import { threatData } from '../../services/dataLayer';

interface ActionsProps {
  newThreatId: string;
  setThreatId: (id: string) => void;
  linkThreat: () => void;
  updateOrigin: (origin: string) => void;
  addAlias: () => void;
  newAlias: string;
  setAlias: (alias: string) => void;
}

interface CommonListProps {
  onAdd: () => void;
  onDelete?: (id: string) => void;
}

export const ActorTTPs: React.FC<CommonListProps & {
  actor: ThreatActor;
  newTTP: { code: string; name: string };
  setNewTTP: (val: { code: string; name: string }) => void;
}> = ({ actor, onAdd, onDelete, newTTP, setNewTTP }) => (
  <div className="space-y-4">
    <div className="flex gap-2">
      <Input value={newTTP.code} onChange={e => setNewTTP({...newTTP, code: e.target.value})} placeholder="Code" className="w-1/3" />
      <Input value={newTTP.name} onChange={e => setNewTTP({...newTTP, name: e.target.value})} placeholder="Technique" className="flex-1" />
      <Button onClick={onAdd}>ADD</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{actor.ttps.map((t: any, i: number) => (
      <Card key={i} className="p-3 flex justify-between items-center"><div className="flex flex-col"><span className="text-red-400 font-mono font-bold text-xs">{t.code}</span><span className="text-slate-300 text-sm">{t.name}</span></div>{onDelete && <button onClick={() => onDelete(t.id)} className="text-slate-600 hover:text-red-500">×</button>}</Card>
    ))}</div>
  </div>
);

export const ActorCampaigns: React.FC<CommonListProps & {
  campaigns: string[];
  newVal: string;
  setVal: (val: string) => void;
}> = ({ campaigns, onAdd, newVal, setVal }) => {
  const handleNav = (campaignName: string) => {
    const campaign = threatData.getCampaigns().find(c => c.name === campaignName);
    if (campaign) {
      window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.CAMPAIGNS, id: campaign.id } }));
    } else {
      alert(`Campaign "${campaignName}" details not found.`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2"><Input value={newVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} placeholder="New Campaign..." className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
      <ul className="space-y-2">
        {campaigns.map((c: string, i: number) => (
          <li key={i} className="text-sm text-slate-300 flex items-center gap-2 group cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => handleNav(c)}>
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full group-hover:bg-cyan-400"></span>
            <span className="border-b border-transparent group-hover:border-cyan-500/50">{c}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ActorInfra: React.FC<CommonListProps & {
  infra: Infrastructure[];
  newVal: string;
  setVal: (val: string) => void;
}> = ({ infra, onAdd, onDelete, newVal, setVal }) => (
  <div className="space-y-4">
    <div className="flex gap-2"><Input value={newVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} placeholder="IP / Domain..." className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
    <div className="space-y-2">{infra.map((i: any) => <div key={i.id} className="bg-slate-950 p-2 rounded border border-slate-800 text-sm flex justify-between items-center"><span className="text-slate-300">{i.value}</span><div className="flex items-center gap-2"><Badge color="green">{i.status}</Badge>{onDelete && <button onClick={() => onDelete(i.id)} className="text-slate-600 hover:text-red-500">×</button>}</div></div>)}</div>
  </div>
);

export const ActorExploits: React.FC<CommonListProps & {
  exploits: string[];
  newVal: string;
  setVal: (val: string) => void;
}> = ({ exploits, onAdd, newVal, setVal }) => (
  <div className="space-y-4">
    <div className="flex gap-2"><Input value={newVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} placeholder="CVE-..." className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
    <ul className="space-y-2">{exploits?.map((e: string, i: number) => <li key={i} className="text-sm text-slate-300 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>{e}</li>)}</ul>
  </div>
);

export const ActorIndustries: React.FC<CommonListProps & {
  targets: string[];
  newVal: string;
  setVal: (val: string) => void;
}> = ({ targets, onAdd, onDelete, newVal, setVal }) => (
  <div className="space-y-4">
    <div className="flex gap-2"><Input value={newVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} placeholder="Industry..." className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
    <div className="flex flex-wrap gap-2">{targets.map((t: string, i: number) => <span key={i} className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-sm text-slate-300 flex items-center gap-2">{t}{onDelete && <button onClick={() => onDelete(t)} className="text-slate-500 ml-1">×</button>}</span>)}</div>
  </div>
);

export const ActorAliases: React.FC<CommonListProps & {
  aliases: string[];
  newVal: string;
  setVal: (val: string) => void;
}> = ({ aliases, onAdd, newVal, setVal }) => (
  <div className="space-y-4">
    <div className="flex gap-2"><Input value={newVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} placeholder="Alias..." className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
    <div className="flex flex-wrap gap-2">{aliases.map((a: string, i: number) => <Badge key={i} color="blue">{a}</Badge>)}</div>
  </div>
);

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
      <div className="bg-slate-900 border border-slate-800 p-4 rounded mb-6">
         <div className="flex gap-2 mb-2"><Input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} /><Input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="Event Title" className="flex-1" /></div>
         <div className="flex gap-2"><Input value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Description" className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
      </div>
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
        )) : (
          <div className="text-slate-500 text-sm pl-8 italic">No timeline events recorded.</div>
        )}
      </div>
    </div>
  );
};

export const ActorAssociations = () => (
  <ResponsiveTable data={[{n:'Lazarus', r:'Co-Op'}, {n:'BlackCat', r:'Affiliate'}]} keyExtractor={(i: any) => i.n} columns={[{header:'Group', render:(i:any)=><span className="text-white">{i.n}</span>}, {header:'Relation', render:(i:any)=><Badge>{i.r}</Badge>}]} renderMobileCard={(i:any) => <div>{i.n}</div>} />
);

export const ActorReferences: React.FC<CommonListProps & {
  references: string[];
  newVal: string;
  setVal: (val: string) => void;
}> = ({ references, onAdd, onDelete, newVal, setVal }) => (
  <div className="space-y-4">
    <div className="flex gap-2"><Input value={newVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} placeholder="URL..." className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
    <div className="space-y-2">{references?.map((r: string, i: number) => <div key={i} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800"><a href={r} target="_blank" rel="noreferrer" className="text-cyan-400 text-sm truncate flex-1 mr-4">{r}</a>{onDelete && <button onClick={() => onDelete(r)} className="text-slate-600 hover:text-red-500">×</button>}</div>)}</div>
  </div>
);

export const ActorProfile: React.FC<{
  actor: ThreatActor;
  actions: ActionsProps;
  linkedThreats: Threat[];
}> = ({ actor, actions, linkedThreats }) => (
  <div className="space-y-6">
    <Card className="p-4 border-l-4 border-l-cyan-500"><h3 className="text-xs font-bold text-slate-500 uppercase">Description</h3><p className="text-sm text-slate-200 mt-2">{actor.description}</p></Card>
    <div className="grid grid-cols-2 gap-4"><Card className="p-4"><div className="text-xs text-slate-500">Origin</div><input className="bg-transparent text-white font-bold w-full border-b border-slate-700" value={actor.origin} onChange={(e) => actions.updateOrigin(e.target.value)} /></Card><Card className="p-4"><div className="text-xs text-slate-500">Sophistication</div><div className="text-white font-bold">{actor.sophistication}</div></Card></div>
    <Card className="p-4"><h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Aliases</h3><ActorAliases aliases={actor.aliases} onAdd={actions.addAlias} newVal={actions.newAlias} setVal={actions.setAlias} /></Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Known Exploits</h3>
        <div className="flex flex-wrap gap-2">
            {actor.exploits && actor.exploits.length > 0 ? actor.exploits.map((exploit: string, i: number) => (
                <a key={i} href={`https://nvd.nist.gov/vuln/detail/${exploit}`} target="_blank" rel="noreferrer" className="px-2 py-1 bg-slate-950 text-orange-400 text-[10px] font-mono rounded border border-orange-900/30 hover:border-orange-500 transition-colors flex items-center gap-1 group">
                    {exploit} <span className="opacity-50 group-hover:opacity-100">↗</span>
                </a>
            )) : <span className="text-xs text-slate-500 italic">No exploits recorded.</span>}
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">OSINT References</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {actor.references && actor.references.length > 0 ? actor.references.map((ref: string, i: number) => (
                <div key={i} className="flex items-center gap-2 overflow-hidden">
                    <span className="w-1 h-1 rounded-full bg-cyan-500 shrink-0"></span>
                    <a href={ref} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-400 hover:text-cyan-300 truncate font-mono">
                        {ref}
                    </a>
                </div>
            )) : <span className="text-xs text-slate-500 italic">No references available.</span>}
        </div>
      </Card>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Infrastructure Details</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {actor.infrastructure && actor.infrastructure.length > 0 ? actor.infrastructure.map((infra: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800">
                        <div className="flex flex-col">
                            <span className="font-mono text-sm text-cyan-400">{infra.value}</span>
                            <span className="text-[10px] text-slate-500">{infra.type}</span>
                        </div>
                        <Badge color={infra.status === 'ACTIVE' ? 'red' : 'green'}>{infra.status}</Badge>
                    </div>
                )) : <span className="text-xs text-slate-500 italic">No infrastructure recorded.</span>}
            </div>
        </Card>

        <Card className="p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Linked Threats</h3>
            <div className="flex gap-2 mb-4"><Input value={actions.newThreatId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => actions.setThreatId(e.target.value)} placeholder="Threat ID" className="flex-1" /><Button onClick={actions.linkThreat}>LINK</Button></div>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {linkedThreats.slice(0,5).map((t: any) => <FeedItem key={t.id} threat={t} />)}
            </div>
        </Card>
    </div>
  </div>
);
