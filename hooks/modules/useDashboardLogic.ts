
import { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import { generateDailyBriefing } from '../../services/geminiService';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../useDataStore';
import { View, Threat, Case, IncidentReport, AppConfig } from '../../types';
import { OverviewLogic } from '../../services/logic/dashboard/CoreLogic';
import { useIsMounted } from '../useIsMounted';

export interface UseDashboardLogicResult {
  activeModule: string;
  handleModuleChange: (newModule: string) => void;
  isPending: boolean;
  briefing: string;
  threats: Threat[];
  cases: Case[];
  reports: IncidentReport[];
  config: AppConfig;
  modules: string[];
  defcon: { level: number; label: string; color: string };
  trend: { count: number; delta: number; trend: 'UP' | 'DOWN' };
  metricsLoading: boolean;
}

export const useDashboardLogic = (): UseDashboardLogicResult => {
  const [activeModule, setActiveModule] = useState<string>('Overview');
  const [isPending, startTransition] = useTransition();
  const [briefing, setBriefing] = useState<string>('DECRYPTING INTELLIGENCE STREAM...');
  
  // New State Hoisted from OverviewView
  const [defcon, setDefcon] = useState({ level: 4, label: 'CALCULATING...', color: 'text-slate-500' });
  const [trend, setTrend] = useState({ count: 0, delta: 0, trend: 'DOWN' as 'UP' | 'DOWN' });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Selector-based subscriptions
  const threats = useDataStore(() => threatData.getThreats());
  const cases = useDataStore(() => threatData.getCases());
  const reports = useDataStore(() => threatData.getReports());
  const config = useDataStore(() => threatData.getAppConfig());
  const modules = useMemo(() => threatData.getModulesForView(View.DASHBOARD), []);
  
  const isMounted = useIsMounted();

  // Unified Data Fetching Effect for Dashboard Context
  useEffect(() => { 
    const loadDashboardData = async () => {
      // Parallel execution for performance
      const [briefingText, defconData, trendData] = await Promise.all([
        generateDailyBriefing(),
        OverviewLogic.calculateDefconLevel(),
        OverviewLogic.getTrendMetrics()
      ]);

      if (isMounted()) {
        setBriefing(briefingText);
        setDefcon(defconData);
        setTrend(trendData);
        setMetricsLoading(false);
      }
    };

    loadDashboardData();
  }, [threats, isMounted]); // Re-calc when threats change

  const handleModuleChange = useCallback((newModule: string) => {
    startTransition(() => {
        setActiveModule(newModule);
    });
  }, []);

  // Initialize active module safely
  useEffect(() => {
    if (!modules.includes(activeModule) && modules.length > 0) {
      setActiveModule(modules[0]);
    }
  }, [modules, activeModule]);

  return {
    activeModule,
    handleModuleChange,
    isPending,
    briefing,
    threats,
    cases,
    reports,
    config,
    modules,
    defcon,
    trend,
    metricsLoading
  };
};
