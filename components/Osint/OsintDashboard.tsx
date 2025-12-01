
import React, { useState } from 'react';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import { SearchViews } from './Views/SearchViews';
import { IdentityViews } from './Views/IdentityViews';
import { InfrastructureViews } from './Views/InfrastructureViews';

const OsintDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.OSINT[0]);

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
      modules={CONFIG.MODULES.OSINT} 
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
