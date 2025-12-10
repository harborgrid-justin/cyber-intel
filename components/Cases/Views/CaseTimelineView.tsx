
import React from 'react';
import { Case } from '../../../types';
import { Timeline, TimelineItem } from '../../Shared/Timeline';

interface CaseTimelineViewProps {
  activeCase: Case;
}

const CaseTimelineView: React.FC<CaseTimelineViewProps> = ({ activeCase }) => {
  const sortedTimeline = [...activeCase.timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const items: TimelineItem[] = sortedTimeline.map(e => ({
    date: e.date,
    title: e.title,
    type: e.type,
    id: e.id
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Investigation Chronology</h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">{items.length} Events</span>
      </div>
      <Timeline items={items} />
    </div>
  );
};
export default CaseTimelineView;
