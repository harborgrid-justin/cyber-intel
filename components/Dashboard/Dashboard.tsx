
import React, { useEffect, useState, useMemo, useTransition, Suspense } from 'react';
import { generateDailyBriefing } from '../../services/geminiService';
import { StandardPage } from '../Shared/Layouts';
import { OverviewView } from './Views/OverviewView';
import { InfraViews } from './Views/InfraViews';
import { SecurityViews } from './Views/SecurityViews';
import { HolographicGlobe } from '../Shared/HolographicGlobe';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { VisibilityGuard } from '../Shared/VisibilityGuard';
import { PhaseTwoMatrix } from './PhaseTwoMatrix';
import { View } from '../../types';
import { LoadingSpinner } from '../Shared/LoadingSpinner';

const Dashboard: React.FC = () => {
  const modules = useMemo(() => threatData.getModulesForView(View.DASHBOARD), []);
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [isPending, startTransition] = useTransition();
  const [briefing, setBriefing] = useState<string>('DECRYPTING INTELLIGENCE STREAM...');
  
  // Optimized selector-based subscriptions
  const threats = useDataStore(() => threatData.getThreats());
  const config = useDataStore(() => threatData.getAppConfig());

  useEffect(() => { 
    generateDailyBriefing().then(setBriefing);
  }, []);

  const handleModuleChange = (newModule: string) => {
    // React 18 Concurrency: Mark this update as low priority
    startTransition(() => {
        setActiveModule(newModule);
    });
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'Overview': return ( <><OverviewView briefing={briefing} /> <PhaseTwoMatrix /></> );
      case 'Global Map': return ( <VisibilityGuard><div className="h-full p-4 min-h-[600px]"><HolographicGlobe threats={threats} /></div></VisibilityGuard> );
      case 'System Health': return <InfraViews.SystemHealth />;
      case 'Network Ops': return <InfraViews.NetworkOps />;
      case 'Cloud Security': return <InfraViews.CloudSecurity />;
      case 'Compliance': return <SecurityViews.Compliance />;
      case 'Insider Threat': return <SecurityViews.InsiderThreat />;
      case 'Dark Web': return <SecurityViews.DarkWeb />;
      default: return ( <><OverviewView briefing={briefing} /> <PhaseTwoMatrix /></> );
    }
  };

  return (
    <StandardPage 
        title="Global Situational Awareness" 
        subtitle={`System Status: ONLINE | Threat Level: ${config.threatLevel}`} 
        modules={modules} 
        activeModule={activeModule} 
        onModuleChange={handleModuleChange}
    >
      <div className={`relative flex flex-col ${isPending ? 'opacity-50 grayscale transition-opacity' : 'opacity-100 transition-opacity'}`}>
        <Suspense fallback={<div className="flex justify-center items-center h-full min-h-[400px]"><LoadingSpinner /></div>}>
            {renderContent()}
        </Suspense>
        {isPending && (
            <div className="absolute top-2 right-2">
                <LoadingSpinner size="sm" />
            </div>
        )}
      </div>
    </StandardPage>
  );
};
export default Dashboard;
