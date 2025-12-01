
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Grid, EmptyState, ProgressBar } from '../Shared/UI';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import DatabaseConnector from './DatabaseConnector';
import { threatData } from '../../services/dataLayer';
import { SystemUser } from '../../types';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { MOCK_NIST_CONTROLS } from '../../constants';
import { SystemLogic } from '../../services/logic/SystemLogic';

const SystemConfig: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.SYSTEM[0]);
  const [users, setUsers] = useState<SystemUser[]>(threatData.getSystemUsers());
  const integrations = threatData.getIntegrations();
  const compliance = SystemLogic.checkNistCompliance(MOCK_NIST_CONTROLS);

  useEffect(() => {
    const refresh = () => setUsers(threatData.getSystemUsers());
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  return (
    <StandardPage title="System Configuration" subtitle="Platform Administration" modules={[...CONFIG.MODULES.SYSTEM, 'Compliance Ops']} activeModule={activeModule} onModuleChange={setActiveModule}>
      {activeModule === 'Database' && <DatabaseConnector />}

      {activeModule === 'Users' && (
        <Card className="overflow-hidden p-0">
          <ResponsiveTable<SystemUser>
            data={users}
            keyExtractor={u => u.id}
            columns={[
              { header: 'Name', render: u => <span className="font-bold text-white">{u.name}</span> },
              { header: 'Role', render: u => <span>{u.role}</span> },
              { header: 'Clearance', render: u => <Badge color={u.clearance === 'TS' ? 'red' : 'blue'}>{u.clearance}</Badge> },
              { header: 'Status', render: u => <div className="flex items-center"><span className={`w-2 h-2 rounded-full inline-block mr-2 ${u.status === 'Online' ? 'bg-green-500' : 'bg-slate-500'}`}></span>{u.status}</div> }
            ]}
            renderMobileCard={u => (
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{u.name}</div>
                  <div className="text-xs text-slate-500">{u.role}</div>
                </div>
                <Badge>{u.clearance}</Badge>
              </div>
            )}
          />
        </Card>
      )}

      {activeModule === 'Integrations' && (
        <Grid cols={3}>{integrations.map((int, i) => (<Card key={i} className="p-5 flex flex-col justify-between h-40"><div className="flex justify-between items-start"><h3 className="font-bold text-white">{int.name}</h3><Badge color={int.status === 'Connected' ? 'green' : 'red'}>{int.status}</Badge></div><div><div className="text-xs text-slate-500 uppercase font-bold mb-2">{int.type} Module</div><Button variant="secondary" className="w-full text-[10px]">CONFIGURE</Button></div></Card>))} <Card className="p-5 flex flex-col items-center justify-center h-40 border-dashed border-slate-700 cursor-pointer"><div className="text-3xl text-slate-600">+</div><div className="text-xs font-bold text-slate-500">ADD INTEGRATION</div></Card></Grid>
      )}

      {activeModule === 'Compliance Ops' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">ATO Status</h3>
                 <div className="text-4xl font-bold text-white mb-2">ATO-C</div>
                 <div className="text-xs text-slate-500">Authority to Operate (Conditional)</div>
                 <div className="mt-4 flex gap-2">
                    <Badge color="green">FedRAMP MOD</Badge>
                    <Badge color="blue">IL-4</Badge>
                 </div>
              </Card>
              <Card className="p-6">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">NIST 800-53 Readiness</h3>
                 <div className="text-4xl font-bold text-cyan-500 mb-2">{compliance.score}%</div>
                 <ProgressBar value={compliance.score} color={compliance.score > 90 ? 'green' : 'orange'} />
                 <div className="text-xs text-slate-500 mt-2">{MOCK_NIST_CONTROLS.length} Controls Monitored</div>
              </Card>
              <Card className="p-6">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Critical Gaps</h3>
                 <ul className="space-y-2">
                    {compliance.criticalGaps.length > 0 ? compliance.criticalGaps.map(g => (
                       <li key={g} className="flex items-center gap-2 text-red-400 text-sm font-mono"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>{g}</li>
                    )) : <li className="text-green-500 text-sm">No Critical Gaps</li>}
                 </ul>
              </Card>
           </div>
           
           <Card className="p-0 overflow-hidden">
              <div className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-white text-sm uppercase">Control Implementation Matrix</div>
              <ResponsiveTable data={MOCK_NIST_CONTROLS} keyExtractor={c => c.id} columns={[
                 { header: 'ID', render: c => <span className="font-mono text-cyan-500 font-bold">{c.id}</span> },
                 { header: 'Family', render: c => <span className="text-slate-400">{c.family}</span> },
                 { header: 'Control Name', render: c => <span className="text-white font-bold">{c.name}</span> },
                 { header: 'Status', render: c => <Badge color={c.status === 'IMPLEMENTED' ? 'green' : c.status === 'PLANNED' ? 'blue' : 'red'}>{c.status}</Badge> },
                 { header: 'Last Audit', render: c => <span className="text-xs text-slate-500 font-mono">{c.lastAudit}</span> }
              ]} renderMobileCard={c => <div>{c.id}</div>} />
           </Card>
        </div>
      )}

      {(activeModule === 'Security Policy' || activeModule === 'System Logs') && (
        <EmptyState message={`System Module ${activeModule} is restricted to Root users.`} />
      )}
    </StandardPage>
  );
};
export default SystemConfig;
