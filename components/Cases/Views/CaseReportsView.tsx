
import React from 'react';
import { IncidentReport, View } from '../../../types';
import { Button, Card, Badge } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';

interface CaseReportsViewProps {
  caseId: string;
  onGenerate: (type: IncidentReport['type']) => void;
}

const CaseReportsView: React.FC<CaseReportsViewProps> = ({ caseId, onGenerate }) => {
  const reports = threatData.getReportsByCase(caseId);

  const handleView = (id: string) => {
    window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.REPORTS, id } }));
  };

  return (
    <div className="space-y-6">
       <div className="flex gap-4">
          <Button onClick={() => onGenerate('Executive')} className="flex-1">+ Executive Summary</Button>
          <Button onClick={() => onGenerate('Forensic')} variant="secondary" className="flex-1">+ Forensic Report</Button>
          <Button onClick={() => onGenerate('Technical')} variant="secondary" className="flex-1">+ Technical Analysis</Button>
       </div>
       
       <div className="space-y-3 mt-6">
         <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Existing Artifacts</div>
         {reports.length > 0 ? reports.map(r => (
           <Card key={r.id} className="p-4 flex justify-between items-center group hover:border-cyan-500 transition-colors">
             <div>
               <div className="font-bold text-white text-sm group-hover:text-cyan-400">{r.title}</div>
               <div className="text-xs text-slate-500 font-mono mt-1">{r.type} • {r.date} • {r.status}</div>
             </div>
             <div className="flex gap-2 items-center">
               <Button onClick={() => handleView(r.id)} variant="text" className="text-cyan-400 text-xs">VIEW</Button>
             </div>
           </Card>
         )) : <div className="p-8 text-center text-slate-500 italic border-2 border-dashed border-slate-800 rounded">No reports generated for this case.</div>}
       </div>
    </div>
  );
};
export default CaseReportsView;
