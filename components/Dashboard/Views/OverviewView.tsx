
import React, { useEffect, useState, Suspense } from 'react';
import { AlertBanner } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { OverviewLogic } from '../../../services/logic/dashboard/CoreLogic';
import { View } from '../../../types';
import AlertTicker from '../../Shared/AlertTicker';
import { CardSkeleton } from '../../Shared/Skeleton';
import { RiskForecast } from '../RiskForecast';
import { IntegrationMatrix } from '../IntegrationMatrix';
import { OverviewKpiGrid } from './OverviewKpiGrid';

// Lazy load heavy chart components
const ThreatChart = React.lazy(() => import('../ThreatChart'));
const GeoMap = React.lazy(() => import('../GeoMap'));
const CategoryRadarChart = React.lazy(() => import('../CategoryRadarChart'));

interface OverviewProps { briefing: string; }

export const OverviewView: React.FC<OverviewProps> = ({ briefing }) => {
  const threats = useDataStore(() => threatData.getThreats());
  const cases = useDataStore(() => threatData.getCases());
  const reports = useDataStore(() => threatData.getReports());
  
  const [defcon, setDefcon] = useState({ level: 4, label: 'CALCULATING...', color: 'text-slate-500' });
  const [trend, setTrend] = useState({ count: 0, delta: 0, trend: 'DOWN' as 'UP' | 'DOWN' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      OverviewLogic.calculateDefconLevel().then(setDefcon);
      OverviewLogic.getTrendMetrics().then(setTrend);
      setLoading(false);
    }, 800);
  }, [threats]);

  const handleNavigate = (view: View) => {
    window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view } }));
  };

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
          handleNavigate={handleNavigate}
          getDefconColor={getDefconColor}
      />

      {/* AI Briefing */}
      <AlertBanner 
          title="Executive AI Briefing" 
          message={briefing}
          type="info"
          className="border-l-4 border-l-cyan-500 bg-slate-900/50 backdrop-blur-sm"
      />

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
