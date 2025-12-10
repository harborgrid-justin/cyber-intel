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
  const modules = useDataStore(() => {
      const baseModules = threatData.getModulesForView(View.SYSTEM);
      // Add new modules if they don't exist
      const newModules = [...baseModules];
      if (!newModules.includes('Theme Designer')) newModules.push('Theme Designer');
      if (!newModules.includes('Compliance Ops')) newModules.push('Compliance Ops');
      if (!newModules.includes('System Actions')) newModules.push('System Actions');
      return newModules;
  });

  const [activeModule, setActiveModule] = useState(modules[0]);
  const [confirmingAction, setConfirmingAction] = useState<'NONE' | 'FLUSH' | 'MAINTENANCE'>('NONE');
  
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

  const handleActionConfirm = () => {
      alert(`Action '${confirmingAction}' executed.`);
      setConfirmingAction('NONE');
  };
  
  const handleModuleChange = (newModule: string) => {
    if (newModule === 'Theme Designer') {
      window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.THEME } }));
    } else {
      setActiveModule(newModule);
    }
  };

  return (
    <StandardPage title="System Configuration" subtitle="Platform Administration" modules={modules} activeModule={activeModule} onModuleChange={handleModuleChange}>
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

      {activeModule === 'System Actions' && (
        <Card className="p-6">
            <h3 className="font-bold text-white text-lg">System Actions</h3>
            <div className="mt-4 flex flex-col md:flex-row gap-4">
                {confirmingAction === 'NONE' ? (
                    <>
                        <Button onClick={() => setConfirmingAction('FLUSH')} variant="danger">FLUSH LOGS</Button>
                        <Button onClick={() => setConfirmingAction('MAINTENANCE')} variant="secondary">MAINTENANCE MODE</Button>
                    </>
                ) : (
                    <div className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center animate-in fade-in duration-300">
                        <div className="flex-1 text-sm text-yellow-300">
                            <strong>Confirm:</strong> {confirmingAction === 'FLUSH' ? 'This will permanently delete old audit logs. Are you sure?' : 'This will lock out non-admin users. Are you sure?'}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleActionConfirm} variant="danger">CONFIRM</Button>
                            <Button onClick={() => setConfirmingAction('NONE')} variant="secondary">CANCEL</Button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
      )}

      {(activeModule === 'Security Policy' || activeModule === 'System Logs' || activeModule === 'Theme Designer') && (
        <EmptyState message={`Select a module to view.`} />
      )}
    </StandardPage>
  );
};
export default SystemConfig;
