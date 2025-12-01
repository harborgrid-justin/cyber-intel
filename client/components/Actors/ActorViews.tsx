
import React from 'react';
import { ThreatActor } from '../../types';
import { Badge, Card, Button, Input, CardHeader, Label, Grid } from '../Shared/UI';
import { ActorAliases, ActorIndustries, ActorReferences, ActorAssociations as AssociationsList, ActorCampaigns } from './Views/ActorEditComponents';
import { ActorTimeline as TimelineComponent } from './ActorViews'; // Keeping timeline logic here for now but renaming export

// Re-exporting Timeline for internal use in Detail
interface TimelineEventInput { date: string; title: string; description: string; }
export const ActorTimeline: React.FC<{
  history: any[];
  onAdd: () => void;
  newEvent: TimelineEventInput;
  setNewEvent: (e: TimelineEventInput) => void;
}> = ({ history, onAdd, newEvent, setNewEvent }) => {
  const sortedHistory = [...(history || [])].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <div className="flex flex-col h-full">
      <Card className="p-0 overflow-hidden bg-slate-900 border border-slate-800 shrink-0 mb-6">
         <CardHeader title="Log New Event" />
         <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <Input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="sm:w-40" />
                <Input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="Event Title" className="flex-1" />
            </div>
            <div className="flex gap-2">
                <Input value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Description" className="flex-1" />
                <Button onClick={onAdd}>ADD</Button>
            </div>
         </div>
      </Card>
      
      <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 pb-4 flex-1">
        {sortedHistory.length > 0 ? sortedHistory.map((e: any, i: number) => (
          <div key={i} className="pl-8 relative group">
             <div className="absolute left-[-9px] top-1 w-4 h-4 bg-slate-950 border-2 border-cyan-600 rounded-full group-hover:bg-cyan-500 transition-colors"></div>
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

export const ActorOperationsView: React.FC<{
    actor: ThreatActor;
    actions: any;
    state: any;
    setters: any;
}> = ({ actor, actions, state, setters }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="flex flex-col gap-6">
                <Card className="flex-1 p-0 overflow-hidden flex flex-col">
                    <CardHeader title="Campaign Involvement" action={<Badge color="purple">{actor.campaigns.length} Active</Badge>} />
                    <div className="p-4 flex-1 overflow-y-auto">
                        <ActorCampaigns campaigns={actor.campaigns} onAdd={actions.addC} newVal={state.newCampaign} setVal={setters.setNewCampaign} />
                    </div>
                </Card>
            </div>
            <div className="flex flex-col h-full">
                <Card className="flex-1 p-0 overflow-hidden flex flex-col">
                    <CardHeader title="Activity Timeline" />
                    <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                        <ActorTimeline 
                            history={actor.history} 
                            onAdd={actions.addTimeEvent} 
                            newEvent={state.newTimelineEvent} 
                            setNewEvent={setters.setNewTimelineEvent} 
                        />
                    </div>
                </Card>
            </div>
        </div>
    );
};

export const ActorDossierView: React.FC<{
  actor: ThreatActor;
  actions: any;
  state: any;
  setters: any;
}> = ({ actor, actions, state, setters }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {/* Identity Header */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 p-6 border-l-4 border-l-cyan-500 flex flex-col justify-between bg-slate-900/80">
            <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Primary Identity</div>
                <h1 className="text-3xl font-bold text-white mb-1">{actor.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                    <Badge color="slate">Origin: {actor.origin}</Badge>
                    <Badge color={actor.sophistication === 'Advanced' ? 'red' : 'orange'}>{actor.sophistication}</Badge>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800">
                <Label>Attribution Update</Label>
                <Input value={actor.origin} onChange={(e) => actions.updateOrigin(e.target.value)} placeholder="Update Origin..." className="text-xs bg-slate-950" />
            </div>
        </Card>
        
        <Card className="lg:col-span-8 p-0 overflow-hidden flex flex-col">
            <CardHeader title="Executive Profile" />
            <div className="p-6 flex-1 bg-slate-900/50">
                <p className="text-sm text-slate-300 leading-relaxed font-serif whitespace-pre-wrap">{actor.description}</p>
            </div>
        </Card>
    </div>

    {/* Details Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-0 overflow-hidden flex flex-col h-96">
            <CardHeader title="Known Aliases" />
            <div className="p-4 flex-1 overflow-y-auto">
                <ActorAliases aliases={actor.aliases} onAdd={actions.addAlias} newVal={actions.newAlias} setVal={setters.setNewAlias} />
            </div>
        </Card>

        <Card className="p-0 overflow-hidden flex flex-col h-96">
            <CardHeader title="Targeted Industries" />
            <div className="p-4 flex-1 overflow-y-auto">
                <ActorIndustries targets={actor.targets} onAdd={actions.addT} onDelete={actions.delT} newVal={state.newTarget} setVal={setters.setNewTarget} />
            </div>
        </Card>

        <Card className="p-0 overflow-hidden flex flex-col h-96">
            <CardHeader title="Affiliated Groups" />
            <div className="p-4 flex-1 overflow-y-auto">
                <AssociationsList />
            </div>
        </Card>
    </div>

    {/* Footer References */}
    <Card className="p-0 overflow-hidden">
        <CardHeader title="OSINT References" />
        <div className="p-6">
            <ActorReferences references={actor.references} onAdd={actions.addRef} onDelete={actions.delRef} newVal={state.newReference} setVal={setters.setNewReference} />
        </div>
    </Card>
  </div>
);
