
import { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import { generateDailyBriefing } from '../../services/geminiService';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../useDataStore';
import { View } from '../../types';

export const useDashboardLogic = () => {
  const [activeModule, setActiveModule] = useState<string>('Overview');
  const [isPending, startTransition] = useTransition();
  const [briefing, setBriefing] = useState<string>('DECRYPTING INTELLIGENCE STREAM...');
  
  // Selector-based subscriptions (Principle 2 & 4)
  const threats = useDataStore(() => threatData.getThreats());
  const config = useDataStore(() => threatData.getAppConfig());
  const modules = useMemo(() => threatData.getModulesForView(View.DASHBOARD), []);

  // Strict Effect Management (Principle 9)
  useEffect(() => { 
    let isMounted = true;
    generateDailyBriefing().then(text => {
      if (isMounted) setBriefing(text);
    });
    return () => { isMounted = false; };
  }, []);

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
    config,
    modules
  };
};
