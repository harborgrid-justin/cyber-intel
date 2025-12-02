
import React from 'react';
import { IncidentReport, View } from '../../types';
import { Button, Badge } from '../Shared/UI';
import { DetailViewHeader } from '../Shared/Layouts';
import { threatData } from '../../services-frontend/dataLayer';

interface Props {
  report: IncidentReport;
  onClose: () => void;
  onDownload?: () => void;
}

const ReportViewer: React.FC<Props> = ({ report, onClose, onDownload }) => {
  
  const handleNavigate = (type: 'CASE' | 'ACTOR' | 'THREAT', id: string) => {
    let view = View.CASES;
    if (type === 'ACTOR') view = View.ACTORS;
    if (type === 'THREAT') view = View.FEED; 
    
    window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view, id } }));
  };

  const handleDownload = () => {
    if (onDownload) {
        onDownload();
    } else {
        const blob = new Blob([report.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title.replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
  };

  const handlePublish = () => {
    threatData.reportStore.publish(report.id);
  };

  const handleArchive = () => {
    threatData.reportStore.archive(report.id);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <DetailViewHeader 
        title={report.title}
        subtitle={`${report.type} Report • ID: ${report.id} • ${report.date}`}
        onBack={onClose}
        tags={<Badge color={report.status === 'READY' ? 'green' : report.status === 'ARCHIVED' ? 'slate' : 'yellow'}>{report.status}</Badge>}
        actions={
            <div className="flex gap-2">
                {report.status === 'DRAFT' && <Button onClick={handlePublish} variant="primary" className="text-[10px] py-1">PUBLISH</Button>}
                {report.status === 'READY' && <Button onClick={handleArchive} variant="danger" className="text-[10px] py-1 border-red-900/50 hover:bg-red-900/30">ARCHIVE</Button>}
                <Button onClick={handleDownload} variant="secondary" className="text-[10px] py-1">
                    EXPORT PDF
                </Button>
            </div>
        }
      />

      {/* Dynamic Linking Bar */}
      {(report.relatedCaseId || report.relatedActorId || report.relatedThreatId) && (
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex flex-wrap gap-3 items-center shrink-0 text-xs">
           <span className="uppercase font-bold text-slate-500 tracking-widest text-[9px]">References:</span>
           {report.relatedCaseId && (
             <span 
                onClick={() => handleNavigate('CASE', report.relatedCaseId!)}
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 cursor-pointer transition-colors bg-blue-900/10 px-2 py-0.5 rounded border border-blue-900/30 font-mono"
             >
                CASE: {report.relatedCaseId}
             </span>
           )}
           {report.relatedActorId && (
             <span 
                onClick={() => handleNavigate('ACTOR', report.relatedActorId!)}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 cursor-pointer transition-colors bg-red-900/10 px-2 py-0.5 rounded border border-red-900/30 font-mono"
             >
                ACTOR PROFILE
             </span>
           )}
        </div>
      )}

      {/* Document Viewport - The "Paper" */}
      <div className="flex-1 overflow-y-auto bg-slate-900/30 p-4 md:p-8 scroll-smooth relative">
        <div className="min-h-[800px] max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300">
           
           {/* Watermark */}
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-900/5 font-black text-9xl rotate-[-45deg] select-none pointer-events-none whitespace-nowrap">
              CONFIDENTIAL
           </div>

           {/* Paper Header */}
           <div className="p-8 md:p-12 border-b border-slate-100 bg-slate-50 relative z-0">
              <div className="flex justify-between items-start mb-8">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sentinel Intelligence</span>
                    <span className="text-slate-900 font-bold tracking-tight text-xs">OFFICIAL RECORD</span>
                 </div>
                 <div className="text-right">
                    <div className="text-red-700 font-bold uppercase border-2 border-red-700 px-2 py-0.5 inline-block text-[10px] tracking-wider">
                       TLP:AMBER
                    </div>
                 </div>
              </div>
              
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4 leading-tight">{report.title}</h1>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[10px] border-t-2 border-slate-900 pt-6">
                 <div>
                    <span className="text-slate-500 uppercase font-bold block mb-1 tracking-wider">Date</span>
                    <span className="text-slate-900 font-mono">{report.date}</span>
                 </div>
                 <div>
                    <span className="text-slate-500 uppercase font-bold block mb-1 tracking-wider">Report ID</span>
                    <span className="text-slate-900 font-mono">{report.id}</span>
                 </div>
                 <div>
                    <span className="text-slate-500 uppercase font-bold block mb-1 tracking-wider">Author</span>
                    <span className="text-slate-900 font-mono">{report.author}</span>
                 </div>
                 <div>
                    <span className="text-slate-500 uppercase font-bold block mb-1 tracking-wider">Classification</span>
                    <span className="text-slate-900 font-mono font-bold">{report.type.toUpperCase()}</span>
                 </div>
              </div>
           </div>

           {/* Paper Body */}
           <div className="p-8 md:p-12 flex-1 relative z-0">
              <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-slate-800 break-words max-w-none">
                {report.content}
              </pre>
           </div>

           {/* Paper Footer */}
           <div className="p-6 bg-slate-50 border-t border-slate-100 text-center relative z-0">
              <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] mb-2">
                 Generated by Sentinel CyberIntel Platform
              </p>
              <p className="text-[8px] text-slate-300">
                 This document contains proprietary and confidential information. Unauthorized distribution is strictly prohibited.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;
