
import React, { useMemo, useState } from 'react';
import { threatData } from '../../services/dataLayer';
import { StandardPage } from '../Shared/Layouts';
import { Button, Card, CardHeader, Badge } from '../Shared/UI';
import { AuditLog, View } from '../../types';
import { Icons } from '../Shared/Icons';
import { SearchFilterBar } from '../Shared/SearchFilterBar';
import { VirtualList } from '../Shared/VirtualList';
import { useAuditLogViewer } from '../../hooks/modules/useAuditLogViewer';

const AuditLogViewer: React.FC = () => {
  const modules = useMemo(() => threatData.getModulesForView(View.AUDIT), []);
  // Fix: The original code used useState without importing it.
  const [activeModule, setActiveModule] = useState(modules[0]);

  const {
    searchTerm, setSearchTerm,
    timeFilter, setTimeFilter,
    filteredLogs,
    handleExport,
  } = useAuditLogViewer();

  const renderLogRow = (l: AuditLog, index: number) => (
    <div key={l.id} className="flex items-center text-xs p-2 border-b border-slate-800 hover:bg-slate-900/50 h-[40px]">
        <div className="w-32 text-slate-500 font-mono shrink-0">{l.timestamp}</div>
        <div className="w-24 shrink-0">
            <Badge color={l.action.includes('FAIL') ? 'red' : l.action.includes('ADMIN') ? 'purple' : 'slate'} className="font-mono text-[9px]">{l.action}</Badge>
        </div>
        <div className="w-32 text-cyan-400 font-bold shrink-0 truncate">{l.user}</div>
        <div className="flex-1 text-slate-300 truncate px-2">{l.details}</div>
        <div className="w-24 text-slate-500 font-mono text-[10px] text-right shrink-0">{l.location || '-'}</div>
    </div>
  );

  return (
    <StandardPage title="System Audit Logs" subtitle="Compliance Tracking & User Activity" modules={modules} activeModule={activeModule} onModuleChange={setActiveModule}>
        <SearchFilterBar 
            searchValue={searchTerm}
            onSearch={setSearchTerm}
            searchPlaceholder="Global Search (User, IP, Action)..."
            filters={[
                {
                    value: timeFilter,
                    onChange: setTimeFilter,
                    options: [
                        { label: 'All Time', value: 'ALL' },
                        { label: 'Last Hour', value: '1H' },
                        { label: 'Last 24h', value: '24H' },
                        { label: 'Last 7 Days', value: '7D' }
                    ],
                    className: 'md:w-40'
                }
            ]}
            actions={
                <Button onClick={handleExport} variant="secondary" className="px-3 whitespace-nowrap">
                    <Icons.Box className="w-4 h-4 mr-2" /> Export
                </Button>
            }
        />
        
        <Card className="flex-1 p-0 overflow-hidden flex flex-col min-h-0 bg-slate-950 border-slate-800">
            <CardHeader title="Master Audit Ledger" action={<Badge color="slate">{filteredLogs.length} Records</Badge>} />
            <div className="bg-slate-900 text-xs font-bold text-slate-500 uppercase flex p-2 border-b border-slate-800">
                <div className="w-32">Timestamp</div>
                <div className="w-24">Action</div>
                <div className="w-32">User</div>
                <div className="flex-1 px-2">Details</div>
                <div className="w-24 text-right">Location</div>
            </div>
            
            <div className="flex-1 w-full min-h-0">
                {filteredLogs.length > 0 ? (
                    <VirtualList 
                        items={filteredLogs}
                        rowHeight={40}
                        containerHeight={600} 
                        renderRow={renderLogRow}
                    />
                ) : (
                    <div className="p-8 text-center text-slate-500">No logs matching criteria.</div>
                )}
            </div>
        </Card>
    </StandardPage>
  );
};
export default AuditLogViewer;