
import React from 'react';
import { Threat, IncidentStatus } from '../../types';
import { threatData } from '../../services/dataLayer';
import KanbanBoard, { KanbanColumn } from '../Shared/KanbanBoard';

interface Props { threats: Threat[]; onUpdate: () => void; }

const IncidentKanban: React.FC<Props> = ({ threats, onUpdate }) => {
  const columns: KanbanColumn[] = [
    { id: IncidentStatus.NEW, title: 'New & Triage' },
    { id: IncidentStatus.INVESTIGATING, title: 'Active Investigation' },
    { id: IncidentStatus.CONTAINED, title: 'Contained / Monitoring' },
    { id: IncidentStatus.CLOSED, title: 'Closed / False Positive' }
  ];

  const handleDrop = (id: string, newStatus: string) => {
    // Commit change to data layer which syncs to storage
    threatData.updateStatus(id, newStatus as IncidentStatus);
    // Trigger refresh of local state
    onUpdate();
  };

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px]">
      <KanbanBoard<Threat>
        columns={columns}
        items={threats}
        groupBy={t => t.status}
        onDrop={handleDrop}
        getItemId={t => t.id}
        renderCard={t => (
          <div className={`bg-slate-900 border p-3 rounded shadow-sm group transition-colors ${
            t.status === IncidentStatus.CLOSED 
              ? 'border-slate-800 opacity-60 hover:opacity-100' 
              : 'border-slate-700 hover:border-cyan-500'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-mono text-cyan-500">{t.id}</span>
              <span className={`h-2 w-2 rounded-full ${t.severity === 'CRITICAL' ? 'bg-red-500' : t.severity === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'}`}></span>
            </div>
            <p className="text-xs text-white font-mono truncate font-bold" title={t.indicator}>{t.indicator}</p>
            <p className="text-[10px] text-slate-500 mt-1 truncate">{t.description}</p>
            <div className="mt-2 flex gap-1 flex-wrap">
               <span className="px-1.5 py-0.5 bg-slate-800 text-[9px] text-slate-400 rounded border border-slate-700 uppercase">{t.type}</span>
               <span className={`px-1.5 py-0.5 bg-slate-800 text-[9px] rounded border border-slate-700 font-bold ${t.score > 80 ? 'text-red-400' : 'text-slate-400'}`}>Score: {t.score}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
};
export default IncidentKanban;
