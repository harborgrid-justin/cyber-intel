
import React from 'react';
import { ThreatActor } from '../../../types';
import { Card, Badge, CardHeader } from '../../Shared/UI';
import { ActorTimeline } from './ActorTimeline';
import { ActorCampaigns } from './ActorEditComponents';

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
