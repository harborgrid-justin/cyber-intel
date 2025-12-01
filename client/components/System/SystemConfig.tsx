
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Grid, EmptyState } from '../Shared/UI';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import DatabaseConnector from './DatabaseConnector';
import { threatData } from '../services-frontend/dataLayer';
import { SystemUser } from '../../types';
import { MOCK_NIST_CONTROLS } from '../../constants';
import { SystemLogic } from '../services-frontend/logic/SystemLogic';
import { ComplianceOps } from './Views/ComplianceOps';
import { UserManagement } from './Views/UserManagement';

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

      {activeModule === 'Users' && <UserManagement users={users} />}

      {activeModule === 'Integrations' && (
        <Grid cols={3}>{integrations.map((int, i) => (<Card key={i} className="p-5 flex flex-col justify-between h-40"><div className="flex justify-between items-start"><h3 className="font-bold text-white">{int.name}</h3><Badge color={int.status === 'Connected' ? 'green' : 'red'}>{int.status}</Badge></div><div><div className="text-xs text-slate-500 uppercase font-bold mb-2">{int.type} Module</div><Button variant="secondary" className="w-full text-[10px]">CONFIGURE</Button></div></Card>))} <Card className="p-5 flex flex-col items-center justify-center h-40 border-dashed border-slate-700 cursor-pointer"><div className="text-3xl text-slate-600">+</div><div className="text-xs font-bold text-slate-500">ADD INTEGRATION</div></Card></Grid>
      )}

      {activeModule === 'Compliance Ops' && (
        <ComplianceOps compliance={compliance} controls={MOCK_NIST_CONTROLS} />
      )}

      {(activeModule === 'Security Policy' || activeModule === 'System Logs') && (
        <EmptyState message={`System Module ${activeModule} is restricted to Root users.`} />
      )}
    </StandardPage>
  );
};
export default SystemConfig;
