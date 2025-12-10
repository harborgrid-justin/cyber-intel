
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge, Grid, EmptyState } from '../Shared/UI';
import { StandardPage } from '../Shared/Layouts';
import DatabaseConnector from './DatabaseConnector';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { SystemLogic } from '../../services/logic/SystemLogic';
import { ComplianceOps } from './Views/ComplianceOps';
import { UserManagement } from './Views/UserManagement';
import { ThemeEditor } from './Views/ThemeEditor';
import { PermissionGate } from '../Shared/PermissionGate';
import { View } from '../../types';

const SystemConfig: React.FC = () => {
  // Memoize module list to prevent re-creation on render
  const modules = useMemo(() => {
      // Fetch modules from config, ensuring Theme Designer is present
      const baseModules = threatData.getModulesForView(View.SYSTEM);
      if (!baseModules.includes('Theme Designer')) {
          return [...baseModules, 'Theme Designer', 'Compliance Ops'];
      }
      return [...baseModules, 'Compliance Ops'];
  }, []);

  const [activeModule, setActiveModule] = useState(modules[0]);
  
  // Efficient subscription
  const users = useDataStore(() => threatData.getSystemUsers());
  const integrations = useDataStore(() => threatData.getIntegrations());
  const nistControls = useDataStore(() => threatData.getNistControls());
  
  const [compliance, setCompliance] = useState({ score: 0, criticalGaps: [] as string[] });

  useEffect(() => {
    const fetchCompliance = async () => {
      const res = await SystemLogic.checkNistCompliance(nistControls);
      setCompliance(res);
    };
    fetchCompliance();
  }, [nistControls]);

  return (
    <StandardPage title="System Configuration" subtitle="Platform Administration" modules={modules} activeModule={activeModule} onModuleChange={setActiveModule}>
      {activeModule === 'Database' && <DatabaseConnector />}

      {activeModule === 'Users' && (
        <PermissionGate resource="user" action="manage" fallback={<EmptyState message="Access Restricted: User Management requires Admin Privileges" />}>
          <UserManagement users={users} />
        </PermissionGate>
      )}

      {activeModule === 'Integrations' && (
        <PermissionGate resource="system" action="config" fallback={<EmptyState message="Access Restricted: System Configuration" />}>
          <Grid cols={3}>{integrations.map((int, i) => (<Card key={i} className="p-5 flex flex-col justify-between h-40"><div className="flex justify-between items-start"><h3 className="font-bold text-white">{int.name}</h3><Badge color={int.status === 'Connected' ? 'green' : 'red'}>{int.status}</Badge></div><div><div className="text-xs text-slate-500 uppercase font-bold mb-2">{int.type} Module</div><Button variant="secondary" className="w-full text-[10px]">CONFIGURE</Button></div></Card>))} <Card className="p-5 flex flex-col items-center justify-center h-40 border-dashed border-slate-700 cursor-pointer"><div className="text-3xl text-slate-600">+</div><div className="text-xs font-bold text-slate-500">ADD INTEGRATION</div></Card></Grid>
        </PermissionGate>
      )}

      {activeModule === 'Compliance Ops' && (
        <ComplianceOps compliance={compliance} controls={nistControls} />
      )}
      
      {activeModule === 'Theme Designer' && (
        <ThemeEditor />
      )}

      {(activeModule === 'Security Policy' || activeModule === 'System Logs') && (
        <EmptyState message={`System Module ${activeModule} is restricted to Root users.`} />
      )}
    </StandardPage>
  );
};
export default SystemConfig;
