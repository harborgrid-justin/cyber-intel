
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge, Grid, CardHeader, Input, FilterGroup, ProgressBar, SectionHeader } from '../Shared/UI';
import { MasterDetailLayout, StandardPage } from '../Shared/Layouts';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { apiClient } from '../../services/apiClient';
import { IncidentReport, View } from '../../types';
import ReportBuilder from './ReportBuilder';
import ReportViewer from './ReportViewer';
import { Icons } from '../Shared/Icons';

interface ReportsCenterProps { initialId?: string; }

const ReportsCenter: React.FC<ReportsCenterProps> = ({ initialId }) => {
  const modules = useMemo(() => threatData.getModulesForView(View.REPORTS), []);
  const [activeModule, setActiveModule] = useState(modules[0]);
  
  // Efficient Subscription
  const reports = useDataStore(() => threatData.getReports());
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(initialId || null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    // Fetch Templates from Backend
    apiClient.get<any[]>('/reports/templates').then(setTemplates).catch(e => {
        // Keep empty or fallback
    });
  }, []);

  useEffect(() => {
    if (initialId) {
      setSelectedReportId(initialId);
      setActiveModule('Library');
    }
  }, [initialId]);

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const handleSave = () => {
    setIsCreating(false);
    setSelectedReportId(null);
    setActiveModule('Library');
  };

  const filteredReports = useMemo(() => {
    return reports
      .filter(r => statusFilter === 'ALL' || r.status === statusFilter)
      .filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reports, statusFilter, searchTerm]);

  // --- Helpers ---
  const getTemplateIcon = (id: string) => {
    switch (id) {
        case 'FEDRAMP': return <Icons.Shield className="w-10 h-10" />;
        case 'NIST': return <Icons.FileText className="w-10 h-10" />;
        case 'CISA': return <Icons.AlertTriangle className="w-10 h-10" />;
        case 'FBI': return <Icons.Users className="w-10 h-10" />;
        case 'EXEC': return <Icons.DollarSign className="w-10 h-10" />;
        default: return <Icons.FileText className="w-10 h-10" />;
    }
  };

  // --- Sub-Components ---

  const ReportList = () => (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-0">
        <div className="shrink-0 bg-slate-950 border-b border-slate-800">
            <SectionHeader 
                title="Intelligence Products" 
                action={<Badge>{filteredReports.length}</Badge>} 
            />
            <div className="p-3 space-y-2">
                <Input 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    placeholder="Search archives..." 
                    className="text-xs"
                />
                <FilterGroup 
                    value={statusFilter} 
                    onChange={setStatusFilter}
                    options={[
                        { label: 'All', value: 'ALL' },
                        { label: 'Draft', value: 'DRAFT', color: 'bg-yellow-500' },
                        { label: 'Ready', value: 'READY', color: 'bg-green-500' },
                        { label: 'Archived', value: 'ARCHIVED', color: 'bg-slate-500' }
                    ]}
                />
                <Button onClick={() => setIsCreating(true)} className="w-full text-xs py-2 mt-2">+ NEW REPORT</Button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            {filteredReports.map(r => (
                <div 
                    key={r.id} 
                    onClick={() => { setSelectedReportId(r.id); setIsCreating(false); }}
                    className={`p-4 border-b border-slate-800 cursor-pointer transition-colors group ${selectedReportId === r.id ? 'bg-slate-800/80 border-l-4 border-l-cyan-500' : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'}`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-mono font-bold truncate ${selectedReportId === r.id ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'}`}>{r.id}</span>
                        <Badge color={r.status === 'READY' ? 'green' : r.status === 'DRAFT' ? 'yellow' : 'slate'}>{r.status}</Badge>
                    </div>
                    <h4 className={`font-bold text-sm mb-1 line-clamp-2 ${selectedReportId === r.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{r.title}</h4>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span className="flex items-center gap-1 truncate"><Icons.FileText className="w-3 h-3" /> {r.type}</span>
                        <span className="whitespace-nowrap ml-2">{r.date}</span>
                    </div>
                </div>
            ))}
            {filteredReports.length === 0 && <div className="p-8 text-center text-slate-500 text-xs italic">No matching reports found.</div>}
        </div>
    </div>
  );

  const ReportsOverview = () => {
    const drafts = reports.filter(r => r.status === 'DRAFT');
    const published = reports.filter(r => r.status === 'READY');
    
    return (
    <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto p-4 md:p-6">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          <Card className="p-4 flex flex-col justify-between border-t-2 border-t-cyan-500">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">Total Assets</div>
             <div className="text-3xl font-bold text-white">{reports.length}</div>
          </Card>
          <Card className="p-4 flex flex-col justify-between border-t-2 border-t-green-500 bg-green-900/10">
             <div className="text-[10px] font-bold text-green-400 uppercase tracking-widest truncate">Published</div>
             <div className="text-3xl font-bold text-green-500">{published.length}</div>
          </Card>
          <Card className="p-4 flex flex-col justify-between border-t-2 border-t-yellow-500 bg-yellow-900/10">
             <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest truncate">Active Drafts</div>
             <div className="text-3xl font-bold text-yellow-500">{drafts.length}</div>
          </Card>
          <Card className="p-4 flex flex-col justify-between border-t-2 border-t-slate-500">
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">Archived</div>
             <div className="text-3xl font-bold text-slate-400">{reports.filter(r => r.status === 'ARCHIVED').length}</div>
          </Card>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
             <CardHeader title="Production Pipeline" />
             <div className="p-6 flex-1 bg-slate-900/30 overflow-y-auto custom-scrollbar">
                {drafts.length > 0 ? (
                    <div className="space-y-4">
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Work In Progress</div>
                        {drafts.slice(0, 5).map(d => (
                            <div key={d.id} onClick={() => setSelectedReportId(d.id)} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-lg hover:border-cyan-500 cursor-pointer group transition-all">
                                <div className="w-10 h-10 rounded bg-yellow-900/20 border border-yellow-500/30 flex items-center justify-center text-yellow-500 shrink-0">
                                    <Icons.FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white group-hover:text-cyan-400 truncate">{d.title}</h4>
                                    <div className="text-xs text-slate-500 truncate">Started by {d.author} • {d.date}</div>
                                </div>
                                <Button variant="secondary" className="text-[10px] shrink-0">RESUME</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                        <Icons.CheckCircle className="w-12 h-12 mb-2 text-green-900" />
                        <div className="text-sm font-bold">Pipeline Clear</div>
                        <p className="text-xs">No active drafts pending review.</p>
                    </div>
                )}
             </div>
          </Card>

          <Card className="p-0 overflow-hidden flex flex-col">
             <CardHeader title="Report Types" />
             <div className="p-6 space-y-4 overflow-y-auto">
                {[
                    { label: 'Executive', count: reports.filter(r => r.type === 'Executive').length, color: 'purple' },
                    { label: 'Forensic', count: reports.filter(r => r.type === 'Forensic').length, color: 'blue' },
                    { label: 'Technical', count: reports.filter(r => r.type === 'Technical').length, color: 'cyan' },
                    { label: 'Compliance', count: reports.filter(r => r.type === 'Compliance').length, color: 'green' },
                ].map((t, i) => (
                    <div key={i} className="group">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span className="font-bold uppercase">{t.label}</span>
                            <span>{t.count}</span>
                        </div>
                        <ProgressBar value={t.count} max={Math.max(...reports.map(r => 1), 10)} color={t.color as any} />
                    </div>
                ))}
             </div>
          </Card>
       </div>
    </div>
  )};

  // --- Main Render ---

  if (activeModule === 'Templates') {
    return (
      <StandardPage 
        title="Report Templates" 
        subtitle="Standardized Reporting Formats"
        modules={modules}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      >
        <Grid cols={4}>
          {templates.map(t => (
            <Card key={t.id} className="p-6 hover:border-cyan-500 transition-colors cursor-pointer group flex flex-col h-full bg-slate-900" onClick={() => { setIsCreating(true); setActiveModule('Library'); }}>
              <div className="mb-4 text-slate-600 group-hover:text-cyan-500 transition-colors">
                 {getTemplateIcon(t.id)}
              </div>
              <h3 className="font-bold text-white mb-2 group-hover:text-cyan-400 text-sm truncate">{t.name}</h3>
              <p className="text-xs text-slate-400 mb-6 flex-1 leading-relaxed line-clamp-3">{t.desc}</p>
              <Button variant="secondary" className="w-full text-xs">USE TEMPLATE</Button>
            </Card>
          ))}
        </Grid>
      </StandardPage>
    );
  }

  if (activeModule === 'Scheduled') {
    return (
      <StandardPage 
        title="Scheduled Reporting" 
        subtitle="Automated Distribution"
        modules={modules}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      >
        <Card className="p-0 overflow-hidden h-full flex flex-col">
           <CardHeader title="Active Schedules" action={<Button variant="primary" className="text-[10px] py-1">+ NEW SCHEDULE</Button>} />
           <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between hover:border-cyan-500 transition-colors group gap-4">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded border border-slate-700 text-cyan-500 group-hover:text-cyan-400 shrink-0">
                        <Icons.Clock className="w-6 h-6" />
                    </div>
                    <div>
                       <div className="font-bold text-white text-sm group-hover:text-cyan-400">Daily Threat Briefing</div>
                       <div className="text-xs text-slate-500 mt-1">
                          <span className="font-bold text-slate-400">Recipients:</span> soc-team@sentinel.co
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Next Run</div>
                        <div className="text-xs text-white font-mono">Tomorrow 08:00</div>
                    </div>
                    <Badge color="green">ACTIVE</Badge>
                 </div>
              </div>
           </div>
        </Card>
      </StandardPage>
    );
  }

  // Library View (MasterDetail)
  return (
    <MasterDetailLayout
      title="Reports Center"
      subtitle="Intelligence Production & Dissemination"
      modules={modules}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      isDetailOpen={!!selectedReportId || isCreating}
      onBack={() => { setSelectedReportId(null); setIsCreating(false); }}
      listContent={<ReportList />}
      detailContent={
        isCreating ? (
          <ReportBuilder onCancel={() => setIsCreating(false)} onSave={handleSave} />
        ) : selectedReport ? (
          <ReportViewer 
            report={selectedReport} 
            onClose={() => setSelectedReportId(null)} 
          />
        ) : (
          <ReportsOverview />
        )
      }
    />
  );
};

export default ReportsCenter;
