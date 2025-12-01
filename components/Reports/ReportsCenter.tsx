
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Grid } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import { threatData } from '../../services/dataLayer';
import { IncidentReport, View } from '../../types';

const TEMPLATES = [
  { id: 'T1', name: 'Executive Summary', desc: 'High-level overview of threats and risks for C-suite.', icon: '📊' },
  { id: 'T2', name: 'Technical Forensic Analysis', desc: 'Deep dive into IoCs, malware analysis, and chain of custody.', icon: '🔬' },
  { id: 'T3', name: 'Daily SOC Briefing', desc: 'Shift handover stats and active incidents.', icon: '📋' },
  { id: 'T4', name: 'Regulatory Compliance', desc: 'GDPR/NIST status report.', icon: '⚖️' },
];

const ReportsCenter: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.REPORTS[0]);
  const [reports, setReports] = useState<IncidentReport[]>(threatData.getReports());

  useEffect(() => {
    const refresh = () => setReports(threatData.getReports());
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  const handleDownload = (r: IncidentReport) => {
    alert(`Downloading ${r.title}.pdf...`);
  };

  const handleNavigate = (type: 'CASE' | 'ACTOR', id: string) => {
    const view = type === 'CASE' ? View.CASES : View.ACTORS;
    window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view, id } }));
  };

  return (
    <StandardPage 
      title="Intelligence Reporting" 
      subtitle="Executive Summaries & Technical Briefs"
      actions={<Button>+ NEW REPORT</Button>} 
      modules={CONFIG.MODULES.REPORTS} 
      activeModule={activeModule} 
      onModuleChange={setActiveModule}
    >
      {activeModule === 'Generated Reports' && (
        <ResponsiveTable<IncidentReport>
          data={reports}
          keyExtractor={r => r.id}
          columns={[
            { header: 'Report ID', render: r => <span className="font-mono text-cyan-500">{r.id}</span> },
            { header: 'Title', render: r => <span className="font-bold text-white">{r.title}</span> },
            { header: 'Type', render: r => <Badge>{r.type}</Badge> },
            { header: 'Date', render: r => <span className="text-slate-400 text-xs">{r.date}</span> },
            { header: 'Links', render: r => (
              <div className="flex gap-1">
                 {r.relatedCaseId && <Badge color="blue" onClick={() => handleNavigate('CASE', r.relatedCaseId!)}>CASE</Badge>}
                 {r.relatedActorId && <Badge color="red" onClick={() => handleNavigate('ACTOR', r.relatedActorId!)}>ACTOR</Badge>}
                 {!r.relatedCaseId && !r.relatedActorId && <span className="text-xs text-slate-600">None</span>}
              </div>
            )},
            { header: 'Actions', render: r => <Button onClick={() => handleDownload(r)} variant="text" className="text-cyan-400">DOWNLOAD</Button> }
          ]}
          renderMobileCard={r => (
            <div className="flex justify-between items-center">
              <div><div className="text-white font-bold">{r.title}</div><div className="text-xs text-slate-500">{r.date}</div></div>
              <Button onClick={() => handleDownload(r)} variant="text" className="text-cyan-400">PDF</Button>
            </div>
          )}
        />
      )}

      {activeModule === 'Templates' && (
        <Grid cols={4}>
          {TEMPLATES.map(t => (
            <Card key={t.id} className="p-6 hover:border-cyan-500 transition-colors cursor-pointer group">
              <div className="text-3xl mb-4">{t.icon}</div>
              <h3 className="font-bold text-white mb-2 group-hover:text-cyan-400">{t.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{t.desc}</p>
              <Button variant="secondary" className="w-full">USE TEMPLATE</Button>
            </Card>
          ))}
        </Grid>
      )}

      {activeModule === 'Scheduled' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <div className="text-slate-500 mb-4">Automated reporting schedules are configured here.</div>
          <div className="grid gap-4 max-w-2xl mx-auto text-left">
            <div className="bg-slate-950 p-4 rounded border border-slate-800 flex justify-between items-center">
              <div><div className="text-white font-bold">Daily Briefing</div><div className="text-xs text-slate-500">Every Morning @ 08:00 UTC -> Email: soc-team@sentinel.co</div></div>
              <Badge color="green">ACTIVE</Badge>
            </div>
            <div className="bg-slate-950 p-4 rounded border border-slate-800 flex justify-between items-center">
               <div><div className="text-white font-bold">Monthly Compliance</div><div className="text-xs text-slate-500">1st of Month -> Email: ciso@sentinel.co</div></div>
               <Badge color="green">ACTIVE</Badge>
            </div>
          </div>
        </div>
      )}
    </StandardPage>
  );
};

export default ReportsCenter;
