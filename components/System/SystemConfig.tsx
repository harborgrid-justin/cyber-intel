
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Grid, EmptyState } from '../Shared/UI';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import DatabaseConnector from './DatabaseConnector';
import { threatData } from '../../services/dataLayer';
import { SystemUser } from '../../types';
import ResponsiveTable from '../Shared/ResponsiveTable';

const SystemConfig: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.SYSTEM[0]);
  const [users, setUsers] = useState<SystemUser[]>(threatData.getSystemUsers());
  const integrations = threatData.getIntegrations();

  useEffect(() => {
    const refresh = () => setUsers(threatData.getSystemUsers());
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  return (
    <StandardPage title="System Configuration" subtitle="Platform Administration" modules={CONFIG.MODULES.SYSTEM} activeModule={activeModule} onModuleChange={setActiveModule}>
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

      {(activeModule === 'Security Policy' || activeModule === 'System Logs') && (
        <EmptyState message={`System Module ${activeModule} is restricted to Root users.`} />
      )}
    </StandardPage>
  );
};
export default SystemConfig;
