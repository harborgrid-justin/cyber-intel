
import React from 'react';
import { Card, Button } from '../Shared/UI';
import { MasterDetailLayout, StandardPage } from '../Shared/Layouts';
import { Grid } from '../Shared/UI'; // Grid imported explicitly
import { Icons } from '../Shared/Icons';
import ReportBuilder from './ReportBuilder';
import ReportViewer from './ReportViewer';
import { ReportList } from './views/ReportList';
import { ReportsOverview } from './views/ReportsOverview';
import { useReportsLogic } from '../../hooks/modules/useReportsLogic';

interface ReportsCenterProps { initialId?: string; }

const ReportsCenter: React.FC<ReportsCenterProps> = ({ initialId }) => {
  const {
    modules, activeModule, setActiveModule, templates,
    selectedReportId, setSelectedReportId, isCreating, setIsCreating,
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    filteredReports, selectedReport, handleSave
  } = useReportsLogic(initialId);

  const getTemplateIcon = (id: string) => {
    switch (id) {
        case 'FEDRAMP': return <Icons.Shield className="w-10 h-10" />;
        case 'NIST': return <Icons.FileText className="w-10 h-10" />;
        case 'CISA': return <Icons.AlertTriangle className="w-10 h-10" />;
        case 'FBI': return <Icons.Users className="w-10 h-10" />;
        default: return <Icons.FileText className="w-10 h-10" />;
    }
  };

  if (activeModule === 'Templates') {
    return (
      <StandardPage title="Report Templates" subtitle="Standardized Reporting Formats" modules={modules} activeModule={activeModule} onModuleChange={setActiveModule}>
        <Grid cols={4}>
          {templates.map(t => (
            <Card key={t.id} className="p-6 hover:border-cyan-500 transition-colors cursor-pointer group flex flex-col h-full bg-slate-900" onClick={() => { setIsCreating(true); setActiveModule('Library'); }}>
              <div className="mb-4 text-slate-600 group-hover:text-cyan-500 transition-colors">{getTemplateIcon(t.id)}</div>
              <h3 className="font-bold text-white mb-2 group-hover:text-cyan-400 text-sm truncate">{t.name}</h3>
              <p className="text-xs text-slate-400 mb-6 flex-1 leading-relaxed line-clamp-3">{t.desc}</p>
              <Button variant="secondary" className="w-full text-xs">USE TEMPLATE</Button>
            </Card>
          ))}
        </Grid>
      </StandardPage>
    );
  }

  // Scheduled View omitted for brevity/LOC, handled by default fallback or added if needed

  return (
    <MasterDetailLayout
      title="Reports Center"
      subtitle="Intelligence Production & Dissemination"
      modules={modules} activeModule={activeModule} onModuleChange={setActiveModule}
      isDetailOpen={!!selectedReportId || isCreating}
      onBack={() => { setSelectedReportId(null); setIsCreating(false); }}
      listContent={
        <ReportList 
            reports={filteredReports} filteredReports={filteredReports}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            selectedReportId={selectedReportId} onSelect={setSelectedReportId}
            onCreate={() => setIsCreating(true)}
        />
      }
      detailContent={
        isCreating ? ( <ReportBuilder onCancel={() => setIsCreating(false)} onSave={handleSave} /> ) 
        : selectedReport ? ( <ReportViewer report={selectedReport} onClose={() => setSelectedReportId(null)} /> ) 
        : ( <ReportsOverview reports={filteredReports} onSelect={setSelectedReportId} /> )
      }
    />
  );
};

export default ReportsCenter;
