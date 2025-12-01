
import React from 'react';
import { ThreatActor, Infrastructure, View } from '../../../types';
import { Badge, Card, Button, Input, CardHeader } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';

interface CommonListProps { onAdd: () => void; onDelete?: (id: string) => void; }

// --- Sub-Components ---

export const ActorTTPs: React.FC<CommonListProps & { actor: ThreatActor; newTTP: { code: string; name: string }; setNewTTP: (val: { code: string; name: string }) => void; }> = ({ actor, onAdd, onDelete, newTTP, setNewTTP }) => (
  <div className="space-y-4">
    <div className="flex gap-2">
      <Input value={newTTP.code} onChange={e => setNewTTP({...newTTP, code: e.target.value})} placeholder="Code" className="w-1/3" />
      <Input value={newTTP.name} onChange={e => setNewTTP({...newTTP, name: e.target.value})} placeholder="Technique" className="flex-1" />
      <Button onClick={onAdd}>ADD</Button>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">{actor.ttps.map((t: any, i: number) => (
      <div key={i} className="p-3 flex justify-between items-center bg-slate-900 border border-slate-800 rounded group hover:border-red-500/30 transition-colors">
          <div className="flex flex-col"><span className="text-red-400 font-mono font-bold text-xs">{t.code}</span><span className="text-slate-300 text-sm">{t.name}</span></div>
          {onDelete && <button onClick={() => onDelete(t.id)} className="text-slate-600 hover:text-red-500 px-2">×</button>}
      </div>
    ))}</div>
  </div>
);

export const ActorCampaigns: React.FC<CommonListProps & { campaigns: string[]; newVal: string; setVal: (val: string) => void; }> = ({ campaigns, onAdd, newVal, setVal }) => {
  const handleNav = (campaignName: string) => {
    const campaign = threatData.getCampaigns().find(c => c.name === campaignName);
    if (campaign) window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.CAMPAIGNS, id: campaign.id } }));
    else alert(`Campaign "${campaignName}" details not found.`);
  };
  return (
    <div className="space-y-4">
      <div className="flex gap-2"><Input value={newVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} placeholder="New Campaign..." className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
      <ul className="space-y-2">{campaigns.map((c: string, i: number) => <li key={i} className="text-sm text-slate-300 flex items-center gap-2 group cursor-pointer hover:text-cyan-400 transition-colors p-2 bg-slate-900 border border-slate-800 rounded" onClick={() => handleNav(c)}><span className="w-1.5 h-1.5 bg-red-500 rounded-full group-hover:bg-cyan-400"></span><span className="border-b border-transparent group-hover:border-cyan-500/50">{c}</span></li>)}</ul>
    </div>
  );
};

export const ActorInfra: React.FC<CommonListProps & { infra: Infrastructure[]; newVal: string; setVal: (val: string) => void; }> = ({ infra, onAdd, onDelete, newVal, setVal }) => (
  <div className="space-y-4">
    <div className="flex gap-2"><Input value={newVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} placeholder="IP / Domain..." className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">{infra.map((i: any) => <div key={i.id} className="bg-slate-950 p-2 rounded border border-slate-800 text-sm flex justify-between items-center"><span className="text-slate-300 font-mono">{i.value}</span><div className="flex items-center gap-2"><Badge color="green">{i.status}</Badge>{onDelete && <button onClick={() => onDelete(i.id)} className="text-slate-600 hover:text-red-500">×</button>}</div></div>)}</div>
  </div>
);

export const ActorExploits: React.FC<CommonListProps & { exploits: string[]; newVal: string; setVal: (val: string) => void; }> = ({ exploits, onAdd, newVal, setVal }) => (
  <div className="space-y-4">
    <div className="flex gap-2"><Input value={newVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} placeholder="CVE-..." className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
    <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">{exploits?.map((e: string, i: number) => <li key={i} className="text-sm text-orange-300 bg-orange-900/10 border border-orange-900/30 p-2 rounded flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>{e}</li>)}</ul>
  </div>
);

export const ActorIndustries: React.FC<CommonListProps & { targets: string[]; newVal: string; setVal: (val: string) => void; }> = ({ targets, onAdd, onDelete, newVal, setVal }) => (
  <div className="space-y-4">
    <div className="flex gap-2"><Input value={newVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} placeholder="Industry..." className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
    <div className="flex flex-wrap gap-2">{targets.map((t: string, i: number) => <span key={i} className="px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-xs text-slate-300 flex items-center gap-2 hover:bg-slate-700 transition-colors cursor-default">{t}{onDelete && <button onClick={() => onDelete(t)} className="text-slate-500 ml-1 hover:text-white">×</button>}</span>)}</div>
  </div>
);

export const ActorAliases: React.FC<CommonListProps & { aliases: string[]; newVal: string; setVal: (val: string) => void; }> = ({ aliases, onAdd, newVal, setVal }) => (
  <div className="space-y-4">
    <div className="flex gap-2"><Input value={newVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} placeholder="Alias..." className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
    <div className="flex flex-wrap gap-2">{aliases.map((a: string, i: number) => <Badge key={i} color="blue">{a}</Badge>)}</div>
  </div>
);

export const ActorReferences: React.FC<CommonListProps & { references: string[]; newVal: string; setVal: (val: string) => void; }> = ({ references, onAdd, onDelete, newVal, setVal }) => (
  <div className="space-y-4">
    <div className="flex gap-2"><Input value={newVal} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} placeholder="URL..." className="flex-1" /><Button onClick={onAdd}>ADD</Button></div>
    <div className="space-y-2">{references?.map((r: string, i: number) => <div key={i} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800"><a href={r} target="_blank" rel="noreferrer" className="text-cyan-400 text-xs truncate flex-1 mr-4 hover:underline">{r}</a>{onDelete && <button onClick={() => onDelete(r)} className="text-slate-600 hover:text-red-500">×</button>}</div>)}</div>
  </div>
);

export const ActorAssociations = () => (
    <div className="space-y-2">
        {[{n:'Lazarus', r:'Co-Op'}, {n:'BlackCat', r:'Affiliate'}].map((a, i) => (
            <div key={i} className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded">
                <span className="text-white text-sm font-bold">{a.n}</span>
                <Badge>{a.r}</Badge>
            </div>
        ))}
    </div>
);

// --- Consolidated View ---

export const TechnicalOpsView: React.FC<{
    actor: ThreatActor;
    actions: any;
    state: any;
    setters: any;
}> = ({ actor, actions, state, setters }) => {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-0 overflow-hidden border-l-4 border-l-red-500">
                <CardHeader title="Tactics, Techniques, & Procedures (TTPs)" action={<Badge color="purple">{actor.ttps.length} TTPs</Badge>} />
                <div className="p-6">
                    <ActorTTPs actor={actor} onAdd={actions.addTP} onDelete={actions.delTP} newTTP={state.newTTP} setNewTTP={setters.setNewTTP} />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-0 overflow-hidden">
                    <CardHeader title="Known Exploits (CVEs)" />
                    <div className="p-6">
                        <ActorExploits exploits={actor.exploits} onAdd={actions.addE} newVal={state.newExploit} setVal={setters.setNewExploit} />
                    </div>
                </Card>
                
                <Card className="p-0 overflow-hidden">
                    <CardHeader title="Infrastructure Assets" />
                    <div className="p-6">
                        <ActorInfra infra={actor.infrastructure} onAdd={actions.addI} onDelete={actions.delI} newVal={state.newInfra} setVal={setters.setNewInfra} />
                    </div>
                </Card>
            </div>
        </div>
    );
};
