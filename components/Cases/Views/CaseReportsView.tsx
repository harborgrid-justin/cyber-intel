
import React from 'react';
import { IncidentReport } from '../../../types';
import { Button, Card, Badge } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';

interface CaseReportsViewProps {
  caseId: string;
  onGenerate: (type: IncidentReport['type']) => void;
}

const CaseReportsView: React.FC<CaseReportsViewProps> = ({ caseId, onGenerate }) => {
  const reports = threatData.getReportsByCase(caseId);

  return (
    <div className="space-y-6">
       <div className="flex gap-4">
          <Button onClick={() => onGenerate('Executive')}>+ Executive Summary</Button>
          <Button onClick={() => onGenerate('Forensic')} variant="secondary">+ Forensic Report</Button>
          <Button onClick={() => onGenerate('Technical')} variant="secondary">+ Technical Analysis</Button>
       </div>
       <div className="space-y-3">
         {reports.length > 0 ? reports.map(r => (
           <Card key={r.id} className="p-4 flex justify-between items-center">
             <div>
               <div className="font-bold text-white">{r.title}</div>
               <div className="text-xs text-slate-500">{r.type} • {r.date}</div>
             </div>
             <div className="flex gap-2 items-center">
               <Badge>{r.status}</Badge>
               <Button variant="text" className="text-cyan-400">VIEW</Button>
             </div>
           </Card>
         )) : <div className="p-8 text-center text-slate-500 italic">No reports generated for this case.</div>}
       </div>
    </div>
  );
};
export default CaseReportsView;
