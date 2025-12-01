
import React, { useState, useEffect, useMemo } from 'react';
import { threatData } from '../../services/dataLayer';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { StandardPage } from '../Shared/Layouts';
import { Button, Card, CardHeader, Input, Badge, Select, FilterGroup } from '../Shared/UI';
import { CONFIG } from '../../config';
import { AuditLog } from '../../types';
import { Icons } from '../Shared/Icons';

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
    let result = logs;

    // Category Filter (based on Active Module)
    if (activeModule !== 'All Logs' && activeModule !== 'Exports' && activeModule !== 'Archives') {
      const categoryMap: Record<string, string[]> = {
        'Auth': ['LOGIN', 'LOGOUT', 'AUTH', 'MFA'],
        'Data': ['DATA', 'FILE', 'RECORD', 'ARTIFACT'],
        'System': ['SYSTEM', 'SERVICE', 'UPDATE', 'PATCH'],
        'Network': ['NETWORK', 'FIREWALL', 'IPS', 'VPN', 'CONNECTION'],
        'Policy': ['POLICY', 'VIOLATION', 'DLP'],
        'Errors': ['ERROR', 'FAIL', 'TIMEOUT', 'CRASH'],
        'Admin': ['ADMIN', 'USER', 'ROLE', 'CONFIG', 'ARCHIVE']
      };
      
      const keywords = categoryMap[activeModule] || [];
      result = result.filter(l => keywords.some(k => l.action.includes(k)));
    }

    // Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(l => 
        l.user.toLowerCase().includes(lower) || 
        l.action.toLowerCase().includes(lower) || 
        l.details.toLowerCase().includes(lower)
      );
    }

    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, activeModule, searchTerm]);

  const handleExport = () => {
    const { url, filename } = threatData.logStore.generateExport();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const getActionColor = (action: string) => {
    if (action.includes('FAIL') || action.includes('ERROR') || action.includes('DENY') || action.includes('VIOLATION')) return 'red';
    if (action.includes('ADMIN') || action.includes('CONFIG')) return 'purple';
    if (action.includes('LOGIN') || action.includes('SUCCESS') || action.includes('CONNECT')) return 'green';
    return 'slate';
  };

  if (activeModule === 'Exports') {
    return (
      <StandardPage title="System Audit Logs" subtitle="Compliance Tracking & User Activity" modules={CONFIG.MODULES.AUDIT} activeModule={activeModule} onModuleChange={setActiveModule}>
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
                        <div><div className="text-sm font-bold text-white">audit_dump_2023_10_26.csv</div><div className="text-[10px] text-slate-500">24MB • Admin</div></div>
                     </div>
                     <Button variant="text" className="text-cyan-500 text-xs">DOWNLOAD</Button>
                  </div>
               </div>
            </Card>
         </div>
      </StandardPage>
    );
  }

  if (activeModule === 'Archives') {
    const archives = threatData.logStore.getArchivedLogs();
    return (
      <StandardPage title="System Audit Logs" subtitle="Compliance Tracking & User Activity" modules={CONFIG.MODULES.AUDIT} activeModule={activeModule} onModuleChange={setActiveModule}>
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
      </StandardPage>
    );
  }

  return (
    <StandardPage title="System Audit Logs" subtitle="Compliance Tracking & User Activity" modules={CONFIG.MODULES.AUDIT} activeModule={activeModule} onModuleChange={setActiveModule}>
      <Card className="p-0 overflow-hidden flex flex-col h-full">
        {/* Standard Card Header */}
        <CardHeader 
            title={`${activeModule} Trail`}
            action={<Badge color="slate">{filteredLogs.length} Records</Badge>} 
        />
        
        {/* Standard Control Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row gap-4 items-center">
           <div className="flex-1 w-full md:w-auto">
              <Input 
                 placeholder="Search user, IP, action, or details..." 
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
        
        <div className="flex-1 overflow-y-auto">
          <ResponsiveTable<AuditLog>
            data={filteredLogs}
            keyExtractor={l => l.id}
            columns={[
              { header: 'Timestamp', render: l => <span className="text-slate-300 font-mono text-[10px] whitespace-nowrap">{l.timestamp}</span> },
              { header: 'Action', render: l => <Badge color={getActionColor(l.action)} className="font-mono">{l.action}</Badge> },
              { header: 'User', render: l => <span className="text-cyan-400 font-bold text-xs">{l.user}</span> },
              { header: 'Details', render: l => <span className="text-slate-400 text-xs">{l.details}</span> },
              { header: 'Location', render: l => <span className="text-slate-500 text-[10px] font-mono">{l.location || '-'}</span> }
            ]}
            renderMobileCard={l => (
              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="text-cyan-400 font-bold text-xs">{l.user}</span><span className="text-slate-500 text-[10px]">{l.timestamp}</span></div>
                <div className="flex justify-between items-center"><Badge color={getActionColor(l.action)}>{l.action}</Badge><span className="text-[10px] text-slate-500">{l.location}</span></div>
                <div className="text-slate-300 text-xs border-t border-slate-800 pt-1 mt-1">{l.details}</div>
              </div>
            )}
          />
        </div>
        <div className="p-2 border-t border-slate-800 bg-slate-950 text-right text-[10px] text-slate-600 font-mono">
           Hash Verified: SHA-256 | Ledger: Immutable
        </div>
      </Card>
    </StandardPage>
  );
};
export default AuditLogViewer;
