
import React from 'react';
import { IncidentReport, View } from '../../types';
import { Button, Badge } from '../Shared/UI';

interface Props {
  report: IncidentReport;
  onClose: () => void;
  onDownload: () => void;
}

const ReportViewer: React.FC<Props> = ({ report, onClose, onDownload }) => {
  const handleNavigate = (type: 'CASE' | 'ACTOR' | 'THREAT', id: string) => {
    let view = View.CASES;
    if (type === 'ACTOR') view = View.ACTORS;
    if (type === 'THREAT') view = View.FEED; 
    
    window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view, id } }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
      {/* App Header Toolbar */}
      <div className="p-3 md:p-4 border-b border-slate-800 bg-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 z-10 shadow-md">
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-1">
             <h2 className="text-base md:text-lg font-bold text-white truncate leading-tight flex items-center gap-2">
               <span className="text-cyan-500">DOC</span> {report.title}
             </h2>
             <Badge color={report.status === 'READY' ? 'green' : 'yellow'}>{report.status}</Badge>
          </div>
          <div className="text-xs text-slate-500 font-mono flex flex-wrap gap-x-3 gap-y-1 items-center">
            <span className="bg-slate-800 px-1.5 rounded text-slate-400">{report.id}</span>
            <span className="hidden md:inline text-slate-700">•</span>
            <span>{report.date}</span>
            <span className="hidden md:inline text-slate-700">•</span>
            <span>{report.type} Report</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button onClick={onDownload} variant="secondary" className="flex-1 md:flex-none justify-center text-xs">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" /></svg>
            EXPORT PDF
          </Button>
          <Button onClick={onClose} variant="text" className="px-3 hover:bg-slate-800 text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </Button>
        </div>
      </div>

      {/* Dynamic Linking Bar */}
      {(report.relatedCaseId || report.relatedActorId || report.relatedThreatId) && (
        <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800 flex flex-wrap gap-3 items-center shrink-0 text-xs">
           <span className="uppercase font-bold text-slate-600 tracking-widest text-[9px]">References:</span>
           {report.relatedCaseId && (
             <span 
                onClick={() => handleNavigate('CASE', report.relatedCaseId!)}
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 cursor-pointer transition-colors bg-blue-900/10 px-2 py-0.5 rounded border border-blue-900/30"
             >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                CASE: {report.relatedCaseId}
             </span>
           )}
           {report.relatedActorId && (
             <span 
                onClick={() => handleNavigate('ACTOR', report.relatedActorId!)}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 cursor-pointer transition-colors bg-red-900/10 px-2 py-0.5 rounded border border-red-900/30"
             >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                ACTOR PROFILE
             </span>
           )}
           {report.relatedThreatId && (
             <span className="flex items-center gap-1.5 text-orange-400 bg-orange-900/10 px-2 py-0.5 rounded border border-orange-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                THREAT ID: {report.relatedThreatId}
             </span>
           )}
        </div>
      )}

      {/* Document Viewport - The "Paper" */}
      <div className="flex-1 overflow-y-auto bg-slate-950 p-2 md:p-8 scroll-smooth relative">
        <div className="min-h-[800px] max-w-4xl mx-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] md:rounded overflow-hidden flex flex-col relative">
           
           {/* Watermark */}
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-900/5 font-black text-9xl rotate-[-45deg] select-none pointer-events-none whitespace-nowrap">
              CONFIDENTIAL
           </div>

           {/* Paper Header */}
           <div className="p-8 md:p-12 border-b border-slate-100 bg-slate-50 relative z-0">
              <div className="flex justify-between items-start mb-8">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sentinel Intelligence</span>
                    <span className="text-slate-900 font-bold tracking-tight">OFFICIAL RECORD</span>
                 </div>
                 <div className="text-right">
                    <div className="text-red-700 font-bold uppercase border-2 border-red-700 px-3 py-1 inline-block text-[10px] tracking-wider">
                       TLP:AMBER // STRICTLY CONFIDENTIAL
                    </div>
                 </div>
              </div>
              
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 mb-4 leading-tight">{report.title}</h1>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs border-t-2 border-slate-900 pt-6">
                 <div>
                    <span className="text-slate-500 uppercase font-bold block mb-1 tracking-wider text-[10px]">Date</span>
                    <span className="text-slate-900 font-mono">{report.date}</span>
                 </div>
                 <div>
                    <span className="text-slate-500 uppercase font-bold block mb-1 tracking-wider text-[10px]">Report ID</span>
                    <span className="text-slate-900 font-mono">{report.id}</span>
                 </div>
                 <div>
                    <span className="text-slate-500 uppercase font-bold block mb-1 tracking-wider text-[10px]">Author</span>
                    <span className="text-slate-900 font-mono">{report.author}</span>
                 </div>
                 <div>
                    <span className="text-slate-500 uppercase font-bold block mb-1 tracking-wider text-[10px]">Classification</span>
                    <span className="text-slate-900 font-mono font-bold">{report.type.toUpperCase()}</span>
                 </div>
              </div>
           </div>

           {/* Paper Body */}
           <div className="p-8 md:p-12 flex-1 relative z-0">
              <pre className="whitespace-pre-wrap font-serif text-sm md:text-base leading-relaxed text-slate-800 break-words max-w-none">
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
