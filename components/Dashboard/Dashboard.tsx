
import React, { Suspense } from 'react';
import { useDashboardLogic } from '../../hooks/modules/useDashboardLogic';
import { StandardPage } from '../Shared/Layouts';
import { LoadingSpinner } from '../Shared/LoadingSpinner';

// Views
import { OverviewView } from './Views/OverviewView';
import { InfraViews } from './Views/InfraViews';
import { SecurityViews } from './Views/SecurityViews';

// Lazy Load Heavy Visuals
const GeoMap = React.lazy(() => import('./GeoMap'));

const Dashboard: React.FC = () => {
  const {
    activeModule,
    handleModuleChange,
    briefing,
    threats,
    cases,
    reports,
    modules,
    defcon,
    trend,
    metricsLoading
  } = useDashboardLogic();

  const renderContent = () => {
    switch (activeModule) {
      case 'Overview':
        return (
          <OverviewView 
            briefing={briefing}
            threats={threats}
            cases={cases}
            reports={reports}
            defcon={defcon}
            trend={trend}
            loading={metricsLoading}
          />
        );
      
      // Infrastructure
      case 'System Health': return <InfraViews.SystemHealth />;
      case 'Network Ops': return <InfraViews.NetworkOps />;
      case 'Cloud Security': return <InfraViews.CloudSecurity />;
      
      // Security / GRC
      case 'Compliance': return <SecurityViews.Compliance />;
      case 'Insider Threat': return <SecurityViews.InsiderThreat />;
      case 'Dark Web': return <SecurityViews.DarkWeb />;
      
      // Visualizations
      case 'Global Map':
        return (
          <Suspense fallback={<div className="h-full flex items-center justify-center"><LoadingSpinner /></div>}>
            <GeoMap threats={threats} fullScreen={true} />
          </Suspense>
        );

      default:
        return (
          <OverviewView 
            briefing={briefing}
            threats={threats}
            cases={cases}
            reports={reports}
            defcon={defcon}
            trend={trend}
            loading={metricsLoading}
          />
        );
    }
  };

  return (
    <StandardPage 
      title="Command Center" 
      subtitle="Executive Situational Awareness"
      modules={modules}
      activeModule={activeModule}
      onModuleChange={handleModuleChange}
    >
      <div className="flex-1 min-h-0 relative">
        {renderContent()}
      </div>
    </StandardPage>
  );
};

export default Dashboard;
