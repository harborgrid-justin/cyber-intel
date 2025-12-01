
import React from 'react';
import { Case } from '../../../types';

interface CaseTimelineViewProps {
  activeCase: Case;
}

const CaseTimelineView: React.FC<CaseTimelineViewProps> = ({ activeCase }) => {
  const sortedTimeline = [...activeCase.timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Investigation Chronology</h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">{sortedTimeline.length} Events</span>
      </div>
      
      <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 py-4">
        {sortedTimeline.length > 0 ? sortedTimeline.map((e, i) => (
            <div key={i} className="pl-8 relative group">
                <div className={`absolute left-[-9px] top-1.5 w-4 h-4 rounded-full border-2 ${
                  e.type === 'ALERT' ? 'bg-slate-950 border-red-500' : 
                  e.type === 'ACTION' ? 'bg-slate-950 border-cyan-500' : 
                  'bg-slate-800 border-slate-500'} transition-colors group-hover:bg-cyan-500`}></div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-mono mb-0.5">{e.date}</span>
                    <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {e.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono uppercase bg-slate-900/50 w-fit px-1.5 rounded">{e.type}</div>
                </div>
            </div>
        )) : <div className="pl-8 text-slate-500 italic">No timeline events recorded for this case.</div>}
      </div>
    </div>
  );
};
export default CaseTimelineView;
