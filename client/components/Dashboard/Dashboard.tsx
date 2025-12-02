
import React, { useEffect, useState } from 'react';
import { generateDailyBriefing } from '../../services-frontend/openAIService';
import { StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import { OverviewView } from './Views/OverviewView';
import { InfraViews } from './Views/InfraViews';
import { SecurityViews } from './Views/SecurityViews';
import GeoMap from './GeoMap'; // Updated component below

const Dashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState(CONFIG.MODULES.DASHBOARD[0]);
  const [briefing, setBriefing] = useState<string>('DECRYPTING INTELLIGENCE STREAM...');

  useEffect(() => { 
    generateDailyBriefing().then(setBriefing);
  }, []);

  const renderContent = () => {
    switch (activeModule) {
      // Core
      case 'Overview': return <OverviewView briefing={briefing} />;
      case 'Global Map': return <GeoMap fullScreen />;
      
      // Infra
      case 'System Health': return <InfraViews.SystemHealth />;
      case 'Network Ops': return <InfraViews.NetworkOps />;
      case 'Cloud Security': return <InfraViews.CloudSecurity />;
      
      // Security
      case 'Compliance': return <SecurityViews.Compliance />;
      case 'Insider Threat': return <SecurityViews.InsiderThreat />;
      case 'Dark Web': return <SecurityViews.DarkWeb />;
      
      default: return <OverviewView briefing={briefing} />;
    }
  };

  return (
    <StandardPage 
      title="Global Situational Awareness" 
      subtitle={`System Status: ONLINE | Threat Level: ${CONFIG.APP.THREAT_LEVEL}`}
      modules={CONFIG.MODULES.DASHBOARD}
      activeModule={activeModule}
      onModuleChange={setActiveModule}
    >
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {renderContent()}
      </div>
    </StandardPage>
  );
};
export default Dashboard;
