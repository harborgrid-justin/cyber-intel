
import React, { useState } from 'react';
import { MOCK_AUDIT_LOGS } from '../../constants';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';

const AuditLogViewer: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.AUDIT[0]);

  return (
    <StandardPage 
      title="System Audit Logs" 
      subtitle="Compliance Tracking & User Activity"
      modules={CONFIG.MODULES.AUDIT} 
      activeModule={activeModule} 
      onModuleChange={setActiveModule}
    >
      <ResponsiveTable
        data={MOCK_AUDIT_LOGS}
        keyExtractor={l => l.id}
        columns={[
          { header: 'Time', render: l => <span className="text-slate-300 font-mono text-xs">{l.timestamp}</span> },
          { header: 'User', render: l => <span className="text-cyan-400 font-mono text-xs">{l.user}</span> },
          { header: 'Action', render: l => <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold">{l.action}</span> },
          { header: 'Details', render: l => <span className="text-slate-500 text-xs">{l.details}</span> }
        ]}
        renderMobileCard={l => (
          <div className="space-y-2">
            <div className="flex justify-between items-center"><span className="text-cyan-400 font-mono text-xs">{l.user}</span><span className="text-slate-500 text-[10px]">{l.timestamp}</span></div>
            <div className="flex items-center gap-2"><span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold text-slate-300">{l.action}</span><span className="text-slate-400 text-xs truncate">{l.details}</span></div>
          </div>
        )}
      />
    </StandardPage>
  );
};
export default AuditLogViewer;
