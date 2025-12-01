
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Grid } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import { threatData } from '../../services/dataLayer';
import { IncidentReport, View } from '../../types';
import ReportBuilder from './ReportBuilder';
import ReportViewer from './ReportViewer';

interface ReportsCenterProps { initialId?: string; }

const ReportsCenter: React.FC<ReportsCenterProps> = ({ initialId }) => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.REPORTS[0]);
  const [reports, setReports] = useState<IncidentReport[]>(threatData.getReports());
  const templates = threatData.getReportTemplates();
  const [mode, setMode] = useState<'LIST' | 'BUILD' | 'VIEW'>('LIST');
  const [viewingReport, setViewingReport] = useState<IncidentReport | null>(null);

  useEffect(() => {
    const refresh = () => setReports(threatData.getReports());
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  useEffect(() => {
    if (initialId) {
      const r = reports.find(rep => rep.id === initialId);
      if (r) { setViewingReport(r); setMode('VIEW'); }
    }
  }, [initialId, reports]);

  const handleDownload = (r: IncidentReport) => {
    const blob = new Blob([r.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${r.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNavigate = (type: 'CASE' | 'ACTOR', id: string) => {
    window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: type === 'CASE' ? View.CASES : View.ACTORS, id } }));
  };

  if (mode === 'BUILD') return <StandardPage title="Report Studio" subtitle="Enterprise Briefing Builder"><ReportBuilder onCancel={() => setMode('LIST')} onSave={() => setMode('LIST')} /></StandardPage>;
  if (mode === 'VIEW' && viewingReport) return <StandardPage title="Report Viewer" subtitle="Document Preview"><ReportViewer report={viewingReport} onClose={() => { setMode('LIST'); setViewingReport(null); }} onDownload={() => handleDownload(viewingReport)} /></StandardPage>;

  return (
    <StandardPage 
      title="Intelligence Reporting" 
      subtitle="Executive Summaries & Technical Briefs"
      actions={<Button onClick={() => setMode('BUILD')}>+ NEW REPORT</Button>} 
      modules={CONFIG.MODULES.REPORTS} 
      activeModule={activeModule} 
      onModuleChange={setActiveModule}
    >
      {activeModule === 'Generated Reports' && (
        <ResponsiveTable<IncidentReport>
          data={reports}
          keyExtractor={r => r.id}
          columns={[
            { header: 'Report ID', render: r => <span className="font-mono text-cyan-500 cursor-pointer hover:underline" onClick={() => { setViewingReport(r); setMode('VIEW'); }}>{r.id}</span> },
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
            { header: 'Actions', render: r => <div className="flex gap-2"><Button onClick={() => { setViewingReport(r); setMode('VIEW'); }} variant="text" className="text-slate-300">VIEW</Button><Button onClick={() => handleDownload(r)} variant="text" className="text-cyan-400">PDF</Button></div> }
          ]}
          renderMobileCard={r => (
            <div className="flex justify-between items-center" onClick={() => { setViewingReport(r); setMode('VIEW'); }}>
              <div><div className="text-white font-bold">{r.title}</div><div className="text-xs text-slate-500">{r.date}</div></div>
              <Button onClick={(e) => { e.stopPropagation(); handleDownload(r); }} variant="text" className="text-cyan-400">PDF</Button>
            </div>
          )}
        />
      )}

      {activeModule === 'Templates' && (
        <Grid cols={4}>
          {templates.map(t => (
            <Card key={t.id} className="p-6 hover:border-cyan-500 transition-colors cursor-pointer group" onClick={() => setMode('BUILD')}>
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
          </div>
        </div>
      )}
    </StandardPage>
  );
};

export default ReportsCenter;
