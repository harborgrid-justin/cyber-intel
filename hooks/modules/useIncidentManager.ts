import { useState, useMemo, useCallback } from 'react';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../useDataStore';
import { View } from '../../types';
import { Threat, Case } from '../../types';

interface IncidentManagerState {
  activeModule: string;
  threats: Threat[];
  cases: Case[];
  error: Error | null;
}

export const useIncidentManager = () => {
  // Modules configuration
  const modules = useMemo(() => threatData.getModulesForView(View.INCIDENTS), []);
  const [activeModule, setActiveModule] = useState<string>(modules[0] || 'Kanban');
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());
  const [error, setError] = useState<Error | null>(null);

  // Secure subscriptions to data stores
  const threats = useDataStore(() => threatData.getThreats());
  const cases = useDataStore(() => threatData.getCases());

  // Manual refresh trigger
  const refresh = useCallback(() => {
    try {
      // Dispatch a global event that stores and hooks can listen to
      window.dispatchEvent(new Event('data-update'));
      setLastRefreshed(Date.now());
      setError(null);
    } catch (err) {
      console.error("[IncidentManager] Refresh failed:", err);
      setError(err instanceof Error ? err : new Error('Unknown error during refresh'));
    }
  }, []);

  return {
    modules,
    activeModule,
    setActiveModule,
    threats,
    cases,
    refresh,
    lastRefreshed,
    error
  };
};
