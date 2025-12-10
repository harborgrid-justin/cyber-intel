
import React, { useState, useEffect } from 'react';
import { SaaSConfigPanel } from './views/SaaSConfigPanel';
import { SecurityPoliciesPanel } from './views/SecurityPoliciesPanel';
import { useLocalStorageSync } from '../../hooks/useLocalStorageSync';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { Card, Button } from '../Shared/UI';
import { ConfirmModal } from '../Shared/ModalConfirm';

const SystemSettings: React.FC = () => {
  // SaaS Config state
  const config = useDataStore(() => threatData.getAppConfig());
  const [tempConfig, setTempConfig] = useState(config);

  useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const saveConfig = () => {
      threatData.updateAppConfig(tempConfig);
      alert('System Configuration Updated');
  };

  // Security Policies state
  const [mfaEnforced, setMfaEnforced] = useLocalStorageSync('sys_mfa', true);
  const [sessionTimeout, setSessionTimeout] = useLocalStorageSync('sys_timeout', '15');
  
  // Other system actions
  const [showConfirm, setShowConfirm] = useState<'NONE' | 'FLUSH' | 'MAINTENANCE'>('NONE');

  return (
    <div className="space-y-6 max-w-4xl">
        <ConfirmModal 
            isOpen={showConfirm !== 'NONE'} 
            onClose={() => setShowConfirm('NONE')} 
            onConfirm={() => alert("Action Executed")}
            title={showConfirm === 'FLUSH' ? 'Flush System Logs' : 'Enable Maintenance Mode'}
            message={showConfirm === 'FLUSH' ? 'This will permanently delete all audit logs older than the retention policy. This action cannot be undone.' : 'This will lock out all non-admin users and terminate active sessions. Proceed?'}
            isDanger={true}
            confirmText="EXECUTE"
        />
        
        <SaaSConfigPanel config={tempConfig} onSave={saveConfig} />
        
        <SecurityPoliciesPanel 
            mfaEnforced={mfaEnforced} 
            setMfaEnforced={setMfaEnforced}
            sessionTimeout={sessionTimeout}
            setSessionTimeout={setSessionTimeout}
        />

        <Card className="p-6 border-l-4 border-l-orange-500">
            <h3 className="font-bold text-white text-lg">System Actions</h3>
            <div className="mt-4 flex gap-4">
                <Button onClick={() => setShowConfirm('FLUSH')} variant="danger">FLUSH LOGS</Button>
                <Button onClick={() => setShowConfirm('MAINTENANCE')} variant="secondary">MAINTENANCE MODE</Button>
            </div>
        </Card>
    </div>
  );
};
export default SystemSettings;
    