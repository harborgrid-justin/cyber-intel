
import React, { useMemo } from 'react';
import { Case } from '../../../types';
import { Card, Badge, Grid, CardHeader } from '../../Shared/UI';
import { IncidentLogic } from '../../../services/logic/IncidentLogic';

interface IncidentTimelineProps {
  cases: Case[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = React.memo(({ cases }) => {
  // Memoize heavy event flattening and sorting
  const events = useMemo(() => {
    return cases
      .flatMap(c => c.timeline.map(e => ({ ...e, caseTitle: c.title })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cases]);

  const metrics = useMemo(() => IncidentLogic.calculateMetrics(cases), [cases]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Grid cols={3}>
            <Card className="p-4 text-center border-t-2 border-t-slate-700">
                <div className="text-[10px] uppercase font-bold text-slate-500">Mean Time To Detect</div>
                <div className="text-2xl font-bold text-white font-mono">{metrics.mttd}</div>
            </Card>
            <Card className="p-4 text-center border-t-2 border-t-cyan-600">
                <div className="text-[10px] uppercase font-bold text-slate-500">Mean Time To Resolve</div>
                <div className="text-2xl font-bold text-cyan-500 font-mono">{metrics.mttr}</div>
            </Card>
            <Card className="p-4 text-center border-t-2 border-t-red-600 bg-red-900/5">
                <div className="text-[10px] uppercase font-bold text-red-400">Adversary Dwell Time</div>
                <div className="text-2xl font-bold text-red-500 font-mono">{metrics.dwellTime}</div>
            </Card>
        </Grid>
        
        <Card className="p-0 overflow-hidden max-w-5xl mx-auto flex flex-col h-[600px]">
          <CardHeader title="Combined Incident Chronology" action={<Badge>{events.length} Events</Badge>} />
          <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {events.map((e, i) => (
              <div key={`${e.id}-${i}`} className="flex gap-4 group">
                  <div className="w-32 text-right text-xs text-slate-500 font-mono py-1 shrink-0">{e.date}</div>
                  <div className="relative flex-1 pb-6 border-l border-slate-800 pl-6 before:absolute before:left-[-5px] before:top-1.5 before:w-2.5 before:h-2.5 before:rounded-full before:transition-colors before:bg-slate-700 group-hover:before:bg-cyan-500">
                    <div className="text-sm text-white font-bold">{e.title}</div>
                    <div className="text-xs text-slate-400 flex gap-2 items-center mt-1">
                      <span>{e.caseTitle}</span>
                      <span className="text-slate-600">•</span>
                      <span className={`font-bold ${e.type === 'ALERT' ? 'text-red-400' : e.type === 'ACTION' ? 'text-cyan-500' : 'text-slate-500'}`}>{e.type}</span>
                    </div>
                  </div>
              </div>
              ))}
              {events.length === 0 && (
                <div className="flex items-center justify-center h-full text-slate-500 italic">
                  No timeline events generated yet.
                </div>
              )}
          </div>
        </Card>
    </div>
  );
});
