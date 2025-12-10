
import React from 'react';
import { Threat, IncidentStatus } from '../../types';
import { threatData } from '../../services/dataLayer';
import { IncidentLogic } from '../../services/logic/IncidentLogic';
import KanbanBoard, { KanbanColumn } from '../Shared/KanbanBoard';
import { Badge } from '../Shared/UI';
import { Icons } from '../Shared/Icons';

interface Props { threats: Threat[]; onUpdate: () => void; }

const IncidentKanban: React.FC<Props> = ({ threats, onUpdate }) => {
  const columns: KanbanColumn[] = [
    { id: IncidentStatus.NEW, title: 'Triage Queue' },
    { id: IncidentStatus.INVESTIGATING, title: 'Active Ops' },
    { id: IncidentStatus.CONTAINED, title: 'Contained' },
    { id: IncidentStatus.CLOSED, title: 'Archived' }
  ];

  const handleDrop = (id: string, newStatus: string) => {
    threatData.updateStatus(id, newStatus as IncidentStatus);
    onUpdate();
  };

  const getSeverityBorder = (sev: string) => {
      switch(sev) {
          case 'CRITICAL': return 'border-l-rose-500';
          case 'HIGH': return 'border-l-orange-500';
          case 'MEDIUM': return 'border-l-yellow-500';
          default: return 'border-l-blue-500';
      }
  };

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px]">
      <KanbanBoard<Threat>
        columns={columns}
        items={threats}
        groupBy={t => t.status}
        onDrop={handleDrop}
        getItemId={t => t.id}
        renderCard={t => {
          const sla = IncidentLogic.getSLAStatus(t);
          const borderClass = getSeverityBorder(t.severity);
          
          return (
            <div className={`
                bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 p-3 rounded-md shadow-sm group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-600
                border-l-[3px] ${borderClass} cursor-grab active:cursor-grabbing
            `}>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-slate-500 font-bold tracking-wider">{t.id}</span>
                    <div className="flex gap-1">
                        {t.type === 'IP Address' && <Icons.Globe className="w-3 h-3 text-slate-600" />}
                        {t.type === 'Malware' && <Icons.AlertTriangle className="w-3 h-3 text-slate-600" />}
                    </div>
                </div>
                
                <div className="font-mono text-xs font-bold text-white truncate mb-1" title={t.indicator}>
                    {t.indicator}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight mb-3">
                    {t.description}
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                    <Badge color={sla.status === 'BREACHED' ? 'red' : sla.status === 'WARNING' ? 'orange' : 'slate'} className="scale-90 origin-left">
                        {sla.timeLeft}
                    </Badge>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase">
                        Score <span className={`text-sm ${t.score > 80 ? 'text-rose-500' : 'text-slate-300'}`}>{t.score}</span>
                    </div>
                </div>
            </div>
          );
        }}
      />
    </div>
  );
};
export default IncidentKanban;
