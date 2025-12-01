
import React from 'react';
import { Case, IncidentReport, View } from '../../../types';
import { Button, Card, CardHeader, Badge } from '../../Shared/UI';
import { threatData } from '../../services-frontend/dataLayer';
import { CaseLogic } from '../../services-frontend/logic/CaseLogic';

interface CaseResponseViewProps {
  activeCase: Case;
  onTransfer: (agency: string) => void;
  onShare: (agency: string) => void;
  onGenerateReport: (type: IncidentReport['type']) => void;
}

const CaseResponseView: React.FC<CaseResponseViewProps> = ({ activeCase, onTransfer, onShare, onGenerateReport }) => {
  const reports = threatData.getReportsByCase(activeCase.id);

  const handleGenerate = (type: IncidentReport['type']) => {
      const content = CaseLogic.generateReportDraft(activeCase, type);
      threatData.addReport({
          id: `RPT-${Date.now()}`,
          title: `${type} Report: ${activeCase.title}`,
          type,
          date: new Date().toLocaleDateString(),
          author: 'Analyst.Me',
          status: 'DRAFT',
          content,
          relatedCaseId: activeCase.id
      });
      // Force update handled by parent via data layer listener usually, but here we rely on parent refresh or store update
      onGenerateReport(type); 
  };

  const handleViewReport = (id: string) => {
      window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.REPORTS, id } }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Left Column: Coordination */}
      <div className="flex flex-col gap-6">
          <Card className="p-0 overflow-hidden border-l-4 border-l-purple-500 bg-slate-950">
             <CardHeader title="Agency Jurisdiction" />
             <div className="p-6">
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                   Current jurisdiction belongs to <span className="text-white font-bold">{activeCase.agency}</span>. 
                   Transferring ownership will revoke write access for local analysts and move the case to the target agency's secure enclave.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => onTransfer('FBI_CYBER')} disabled={!CaseLogic.validateTransfer(activeCase, 'FBI_CYBER')} variant="outline" className="border-purple-900 text-purple-400 hover:bg-purple-900/20 hover:border-purple-500 flex-1">TRANSFER TO FBI</Button>
                  <Button onClick={() => onTransfer('INTERPOL')} disabled={!CaseLogic.validateTransfer(activeCase, 'INTERPOL')} variant="outline" className="border-purple-900 text-purple-400 hover:bg-purple-900/20 hover:border-purple-500 flex-1">TRANSFER TO INTERPOL</Button>
                </div>
             </div>
          </Card>
          
          <Card className="p-0 overflow-hidden border-l-4 border-l-blue-500 bg-slate-950 flex-1">
             <CardHeader title="Joint Task Force Sharing" />
             <div className="p-6">
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                   Sharing provides read-only access to partner agencies while maintaining local chain of custody. This action is logged in the inter-agency ledger.
                </p>
                <div className="flex gap-3 flex-wrap mb-6">
                  <Button onClick={() => onShare('NSA')} disabled={!CaseLogic.validateSharing(activeCase, 'NSA')} variant="outline" className="border-blue-900 text-blue-400 hover:bg-blue-900/20 hover:border-blue-500 flex-1">SHARE: NSA</Button>
                  <Button onClick={() => onShare('CISA')} disabled={!CaseLogic.validateSharing(activeCase, 'CISA')} variant="outline" className="border-blue-900 text-blue-400 hover:bg-blue-900/20 hover:border-blue-500 flex-1">SHARE: CISA</Button>
                </div>
                <div className="text-xs text-slate-500 font-mono p-3 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
                  <span>ACTIVE PARTNERS:</span>
                  <span className="text-blue-400 font-bold">{activeCase.sharedWith.length > 0 ? activeCase.sharedWith.join(', ') : 'NONE'}</span>
                </div>
             </div>
          </Card>
      </div>

      {/* Right Column: Reporting */}
      <Card className="p-0 overflow-hidden flex flex-col h-full">
          <CardHeader title="Reporting Center" />
          <div className="p-6 flex-1 flex flex-col">
             <div className="flex gap-3 mb-6">
                <Button onClick={() => handleGenerate('Executive')} className="flex-1 py-4 text-xs">+ Executive Summary</Button>
                <Button onClick={() => handleGenerate('Forensic')} variant="secondary" className="flex-1 py-4 text-xs">+ Forensic Report</Button>
                <Button onClick={() => handleGenerate('Technical')} variant="secondary" className="flex-1 py-4 text-xs">+ Technical Analysis</Button>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar bg-slate-900/30 rounded-lg p-2 border border-slate-800/50">
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-2 mb-2">Existing Artifacts</div>
               {reports.length > 0 ? reports.map(r => (
                 <div key={r.id} className="p-3 bg-slate-950 border border-slate-800 rounded flex justify-between items-center group hover:border-cyan-500 transition-colors cursor-pointer" onClick={() => handleViewReport(r.id)}>
                   <div>
                     <div className="font-bold text-white text-sm group-hover:text-cyan-400">{r.title}</div>
                     <div className="text-[10px] text-slate-500 font-mono mt-1">{r.type} • {r.date} • <span className={r.status === 'READY' ? 'text-green-500' : 'text-yellow-500'}>{r.status}</span></div>
                   </div>
                   <Button variant="text" className="text-cyan-400 text-[10px]">OPEN</Button>
                 </div>
               )) : <div className="p-8 text-center text-slate-500 italic border-2 border-dashed border-slate-800 rounded">No reports generated for this case.</div>}
             </div>
          </div>
      </Card>
    </div>
  );
};
export default CaseResponseView;
