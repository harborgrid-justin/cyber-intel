
import React from 'react';
import { Card, Button, Input, CardHeader } from '../../Shared/UI';
import { Timeline, TimelineItem } from '../../Shared/Timeline';

interface TimelineEventInput { date: string; title: string; description: string; }

export const ActorTimeline: React.FC<{
  history: any[];
  onAdd: () => void;
  newEvent: TimelineEventInput;
  setNewEvent: (e: TimelineEventInput) => void;
}> = ({ history, onAdd, newEvent, setNewEvent }) => {
  const sortedHistory = [...(history || [])].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const timelineItems: TimelineItem[] = sortedHistory.map((e: any, i: number) => ({
    id: `hist-${i}`,
    date: e.date,
    title: e.title,
    description: e.description,
    type: 'ACTION'
  }));

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
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <Timeline items={timelineItems} />
      </div>
    </div>
  );
};
