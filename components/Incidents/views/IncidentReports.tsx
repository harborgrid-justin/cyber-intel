import React from 'react';
import { Card, Button } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';

export const IncidentReports: React.FC = () => {
  const handleGenerate = (type: string) => {
     threatData.addReport({
        id: `RPT-INC-${Date.now()}`, 
        title: `Incident Response: ${type}`, 
        type: 'Technical',
        date: new Date().toLocaleDateString(), 
        author: 'System', 
        status: 'DRAFT',
        content: `Generated ${type} report based on active incidents.`
     });
     alert(`Report '${type}' generated. Check Reports Center.`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {['Executive Summary', 'Technical Forensics', 'Compliance Audit', 'IoC Export (STIX)'].map(r => (
        <Card key={r} className="p-6 flex flex-col items-center justify-center gap-4 hover:border-cyan-500 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-cyan-600 transition-all">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <span className="text-sm font-bold text-slate-300">{r}</span>
          <Button variant="secondary" className="w-full" onClick={() => handleGenerate(r)}>Generate</Button>
        </Card>
      ))}
    </div>
  );
};

export default IncidentReports;
