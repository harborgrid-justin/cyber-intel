
import React, { Suspense } from 'react';
import { AlertBanner } from '../../Shared/UI';
import { View, Threat, Case, IncidentReport } from '../../../types';
import AlertTicker from '../../Shared/AlertTicker';
import { CardSkeleton } from '../../Shared/Skeleton';
import { RiskForecast } from '../RiskForecast';
import { IntegrationMatrix } from '../IntegrationMatrix';
import { OverviewKpiGrid } from './OverviewKpiGrid';
import { useNavigate } from '../../../hooks/useNavigate';
import AudioPlayer from '../../Shared/AudioPlayer';

// Lazy load heavy chart components
const ThreatChart = React.lazy(() => import('../ThreatChart'));
const GeoMap = React.lazy(() => import('../GeoMap'));
const CategoryRadarChart = React.lazy(() => import('../CategoryRadarChart'));

interface OverviewProps { 
  briefing: string;
  threats: Threat[];
  cases: Case[];
  reports: IncidentReport[];
  defcon: { level: number; label: string; color: string };
  trend: { count: number; delta: number; trend: 'UP' | 'DOWN' };
  loading: boolean;
}

export const OverviewView: React.FC<OverviewProps> = ({ 
  briefing, threats, cases, reports, defcon, trend, loading 
}) => {
  
  const navigate = useNavigate();

  const getDefconColor = (level: number) => {
      if (level === 1) return 'red';
      if (level === 2) return 'orange';
      if (level === 3) return 'yellow';
      return 'green';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="-mt-2 mb-2">
         <AlertTicker threats={threats} />
      </div>

      <OverviewKpiGrid 
          loading={loading}
          trend={trend}
          cases={cases}
          defcon={defcon}
          reports={reports}
          handleNavigate={navigate}
          getDefconColor={getDefconColor}
      />

      {/* AI Briefing */}
      <AlertBanner 
          title="Executive AI Briefing" 
          message={briefing}
          type="info"
          className="border-l-4 border-l-cyan-500 bg-slate-900/50 backdrop-blur-sm"
      >
        <div className="mt-4">
          <AudioPlayer text={briefing} />
        </div>
      </AlertBanner>

      {/* Integration Matrix */}
      <IntegrationMatrix />

      {/* Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6 h-96">
            <Suspense fallback={<CardSkeleton />}>
              <ThreatChart />
            </Suspense>
        </div>
        <div className="flex flex-col gap-6 h-full">
            <Suspense fallback={<CardSkeleton />}>
              <CategoryRadarChart />
            </Suspense>
            <RiskForecast />
        </div>
      </div>
      
      {/* Map Row */}
      <div className="h-80 w-full">
          <Suspense fallback={<CardSkeleton />}>
            <GeoMap threats={threats} />
          </Suspense>
      </div>
    </div>
  );
};
