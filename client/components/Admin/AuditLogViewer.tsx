
import React, { useState, useEffect, useMemo } from 'react';
import { threatData } from '../services-frontend/dataLayer';
import { StandardPage } from '../Shared/Layouts';
import { Button, Card, CardHeader, Input, Badge, Select, FilterGroup } from '../Shared/UI';
import { CONFIG } from '../../config';
import { AuditLog } from '../../types';
import { Icons } from '../Shared/Icons';
import { AuditLogic } from '../services-frontend/logic/AuditLogic';
import ResponsiveTable from '../Shared/ResponsiveTable';

// specialized views
import { AuthLogsView, NetworkLogsView, PolicyLogsView } from './Views/SecurityAuditViews';
import { DataLogsView, SystemLogsView, AdminLogsView, ErrorLogsView } from './Views/OperationalAuditViews';

const AuditLogViewer: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.AUDIT[0]);
  const [logs, setLogs] = useState<AuditLog[]>(threatData.getAuditLogs());
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('ALL');

  useEffect(() => {
    const refresh = () => setLogs(threatData.getAuditLogs());
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  const filteredLogs = useMemo(() => {
    return AuditLogic.filterLogs(logs, timeFilter, searchTerm);
  }, [logs, timeFilter, searchTerm]);

  const handleExport = () => {
    const { url, filename } = threatData.logStore.generateExport();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  // --- View Router ---
  const renderContent = () => {
    // Specific Logic Views
    if (activeModule === 'Auth') return <AuthLogsView logs={filteredLogs} />;
    if (activeModule === 'Data') return <DataLogsView logs={filteredLogs} />;
    if (activeModule === 'System') return <SystemLogsView logs={filteredLogs} />;
    if (activeModule === 'Network') return <NetworkLogsView logs={filteredLogs} />;
    if (activeModule === 'Policy') return <PolicyLogsView logs={filteredLogs} />;
    if (activeModule === 'Admin') return <AdminLogsView logs={filteredLogs} />;
    if (activeModule === 'Errors') return <ErrorLogsView logs={filteredLogs} />;
    
    // Auxiliary Views
    if (activeModule === 'Exports') {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <Card className="p-6 flex flex-col justify-center items-center gap-4 bg-slate-900 border border-slate-800">
                    <Icons.Box className="w-16 h-16 text-slate-700" />
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-white mb-2">Generate Compliance Report</h3>
                        <p className="text-sm text-slate-400 mb-6">Export full system audit logs for external auditing (SOC2, HIPAA).</p>
                        <Button onClick={handleExport} variant="primary">DOWNLOAD CSV</Button>
                    </div>
                </Card>
                <Card className="p-0 overflow-hidden">
                    <CardHeader title="Recent Exports" />
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center bg-slate-950 p-3 rounded border border-slate-800">
                            <div className="flex items-center gap-3">
                                <Icons.FileText className="w-5 h-5 text-green-500" />
                                <div><div className="text-sm font-bold text-white">audit_dump_latest.csv</div><div className="text-[10px] text-slate-500">24MB • Admin</div></div>
                            </div>
                            <Button variant="text" className="text-cyan-500 text-xs">DOWNLOAD</Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    if (activeModule === 'Archives') {
        const archives = threatData.logStore.getArchivedLogs();
        return (
            <Card className="p-0 overflow-hidden">
                <CardHeader title="Cold Storage Archives" action={<Badge color="blue">Retention: 365 Days</Badge>} />
                <ResponsiveTable 
                    data={archives} 
                    keyExtractor={a => a.id}
                    columns={[
                        { header: 'Archive ID', render: a => <span className="font-mono text-cyan-500">{a.id}</span> },
                        { header: 'Date Range', render: a => <span className="text-white">{a.date}</span> },
                        { header: 'Size', render: a => <span className="text-slate-400 font-mono">{a.size}</span> },
                        { header: 'Status', render: a => <Badge color="slate">{a.status}</Badge> },
                        { header: 'Action', render: a => <Button variant="outline" className="text-[10px]">REQUEST RESTORE</Button> }
                    ]}
                    renderMobileCard={a => <div>{a.id}</div>}
                />
            </Card>
        );
    }

    // Default 'All Logs' View
    return (
        <Card className="p-0 overflow-hidden flex flex-col h-full">
            <CardHeader title="Master Audit Ledger" action={<Badge color="slate">{filteredLogs.length} Records</Badge>} />
            <div className="flex-1 overflow-y-auto">
                <ResponsiveTable<AuditLog>
                    data={filteredLogs}
                    keyExtractor={l => l.id}
                    columns={[
                        { header: 'Timestamp', render: l => <span className="text-slate-300 font-mono text-[10px] whitespace-nowrap">{l.timestamp}</span> },
                        { header: 'Action', render: l => <Badge color={l.action.includes('FAIL') ? 'red' : l.action.includes('ADMIN') ? 'purple' : 'slate'} className="font-mono">{l.action}</Badge> },
                        { header: 'User', render: l => <span className="text-cyan-400 font-bold text-xs">{l.user}</span> },
                        { header: 'Details', render: l => <span className="text-slate-400 text-xs">{l.details}</span> },
                        { header: 'Location', render: l => <span className="text-slate-500 text-[10px] font-mono">{l.location || '-'}</span> }
                    ]}
                    renderMobileCard={l => <div>{l.action}</div>}
                />
            </div>
        </Card>
    );
  };

  return (
    <StandardPage title="System Audit Logs" subtitle="Compliance Tracking & User Activity" modules={CONFIG.MODULES.AUDIT} activeModule={activeModule} onModuleChange={setActiveModule}>
        {/* Universal Filter Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row gap-4 items-center shrink-0 rounded-lg mb-4">
           <div className="flex-1 w-full md:w-auto">
              <Input 
                 placeholder="Global Search (User, IP, Action)..." 
                 value={searchTerm} 
                 onChange={e => setSearchTerm(e.target.value)} 
                 className="bg-slate-950 border-slate-800"
              />
           </div>
           <div className="flex gap-2 w-full md:w-auto">
              <Select value={timeFilter} onChange={e => setTimeFilter(e.target.value)} className="w-full md:w-40 bg-slate-950 border-slate-800">
                 <option value="ALL">All Time</option>
                 <option value="1H">Last Hour</option>
                 <option value="24H">Last 24h</option>
                 <option value="7D">Last 7 Days</option>
              </Select>
              <Button onClick={handleExport} variant="secondary" className="px-3 whitespace-nowrap">
                 <Icons.Box className="w-4 h-4 mr-2" /> Export
              </Button>
           </div>
        </div>
        
        <div className="flex-1 min-h-0 overflow-hidden">
            {renderContent()}
        </div>
    </StandardPage>
  );
};
export default AuditLogViewer;
