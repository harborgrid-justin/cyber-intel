
import React, { useMemo } from 'react';
import { Case, Artifact } from '../../../types';
import { Card, CardHeader, Badge } from '../../Shared/UI';
import EvidenceManager from '../EvidenceManager';
import { threatData } from '../../services-frontend/dataLayer';

interface Props {
  activeCase: Case;
  onAddArtifact: (a: Artifact) => void;
  onDeleteArtifact: (id: string) => void;
}

const CaseEvidenceView: React.FC<Props> = ({ activeCase, onAddArtifact, onDeleteArtifact }) => {
  // Filter audit logs relevant to this case
  const caseLogs = useMemo(() => {
    return threatData.getAuditLogs().filter(l => 
        l.details.includes(activeCase.id) || 
        l.details.includes(activeCase.title) || 
        l.action.includes('CASE') ||
        activeCase.artifacts.some(a => l.details.includes(a.name))
    );
  }, [activeCase]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
            <EvidenceManager artifacts={activeCase.artifacts} onAdd={onAddArtifact} onDelete={onDeleteArtifact} />
        </div>
        <Card className="p-0 overflow-hidden flex-1 min-h-[300px] flex flex-col">
            <CardHeader title="Case Audit Trail" action={<Badge color="slate">{caseLogs.length} Events</Badge>} />
            <div className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                {caseLogs.length > 0 ? caseLogs.slice(0, 50).map(l => (
                    <div key={l.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center group hover:border-slate-700 transition-colors">
                        <div className="flex gap-3 items-center">
                            <div className="text-[10px] text-slate-500 font-mono">{l.timestamp}</div>
                            <div className="text-xs text-cyan-500 font-bold">{l.action}</div>
                        </div>
                        <div className="text-xs text-slate-400 group-hover:text-white max-w-md truncate">{l.details}</div>
                        <div className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-500">{l.user}</div>
                    </div>
                )) : <div className="text-center text-slate-500 italic py-4">No audit logs recorded for this case yet.</div>}
            </div>
        </Card>
    </div>
  );
};
export default CaseEvidenceView;
