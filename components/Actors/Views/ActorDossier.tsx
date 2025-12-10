
import React from 'react';
import { ThreatActor } from '../../../types';
import { Card, Badge, CardHeader, Label, Input, DataField } from '../../Shared/UI';
import { ActorAliases, ActorIndustries, ActorReferences, ActorAssociations as AssociationsList } from './ActorEditComponents';

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
                <DataField label="Primary Identity" value={<h1 className="text-3xl font-bold text-white mb-1">{actor.name}</h1>} className="mb-2" />
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
