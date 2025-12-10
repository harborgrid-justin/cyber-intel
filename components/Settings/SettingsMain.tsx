import React, { useState } from 'react';
import { SettingsLayout } from './SettingsLayout';
import { ProfileSettings } from './ProfileSettings';
import { NotificationSettings } from './NotificationSettings';
import { APIKeySettings } from './APIKeySettings';
import { IntegrationsSettings } from './IntegrationsSettings';
// Fix: Use a default import for SystemSettings as it is exported as default.
import SystemSettings from './SystemSettings';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { PageContainer, HeaderContainer, PageHeader } from '../Shared/UI';

const SettingsMain: React.FC = () => {
  const [activeModule, setActiveModule] = useState('Profile');
  const currentUser = useDataStore(() => threatData.currentUser);

  const renderContent = () => {
    switch (activeModule) {
      case 'Profile': return <ProfileSettings />;
      case 'Notifications': return <NotificationSettings />;
      case 'API Keys': return <APIKeySettings />;
      case 'Integrations': return <IntegrationsSettings />;
      case 'System': return <SystemSettings />;
      default: return <ProfileSettings />;
    }
  };

  return (
    <PageContainer noPadding>
       <HeaderContainer>
          <PageHeader 
            title="Platform Configuration" 
            subtitle={`User ID: ${currentUser?.id || 'Unknown'}`} 
          />
       </HeaderContainer>
       
       <div className="flex-1 min-h-0 overflow-hidden">
          <SettingsLayout activeModule={activeModule} onModuleChange={setActiveModule}>
             {renderContent()}
          </SettingsLayout>
       </div>
    </PageContainer>
  );
};

export default SettingsMain;
