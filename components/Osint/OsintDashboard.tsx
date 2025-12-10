
import React, { useState, useMemo } from 'react';
import { StandardPage } from '../Shared/Layouts';
import { SearchViews } from './Views/SearchViews';
import { IdentityViews } from './Views/IdentityViews';
import { InfrastructureViews } from './Views/InfrastructureViews';
import { threatData } from '../../services/dataLayer';
import { View } from '../../types';
import { useDataStore } from '../../hooks';

const OsintDashboard: React.FC = () => {
  const modules = useDataStore(() => threatData.getModulesForView(View.OSINT));
  const [activeModule, setActiveModule] = useState(modules[0]);

  const renderContent = () => {
    switch (activeModule) {
      case 'Central Search': return <SearchViews.CentralSearch />;
      case 'Domain Intel': return <SearchViews.DomainIntel />;
      
      case 'Email Breach': return <IdentityViews.EmailBreach />;
      case 'Social Graph': return <IdentityViews.SocialGraph />;
      
      case 'IP Geolocation': return <InfrastructureViews.IpGeolocation />;
      case 'Metadata': return <InfrastructureViews.Metadata />;
      case 'Dark Web': return <InfrastructureViews.DarkWeb />;
      
      default: return <SearchViews.CentralSearch />;
    }
  };

  return (
    <StandardPage 
      title="OSINT Toolkit" 
      subtitle="Open Source Intelligence Gathering & Analysis" 
      modules={modules} 
      activeModule={activeModule} 
      onModuleChange={setActiveModule}
    >
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderContent()}
      </div>
    </StandardPage>
  );
};
export default OsintDashboard;
