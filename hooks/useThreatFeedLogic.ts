
import { useState, useMemo, useEffect } from 'react';
import { threatData } from '../services/dataLayer';
import { useDataStore } from './useDataStore';
import { useTQL } from './useTQL';
import { Threat, View } from '../types';

export const useThreatFeedLogic = (initialQuery?: string) => {
  const modules = useMemo(() => threatData.getModulesForView(View.FEED), []);
  const [activeModule, setActiveModule] = useState(modules[0]);
  const [query, setQuery] = useState(initialQuery || '');
  
  // Safe subscription via hardened BaseStore.getAll() implicitly through DataLayer getter
  const allThreats = useDataStore(() => threatData.getThreats());

  // TQL Engine Integration
  const { results: filteredThreats, error: searchError } = useTQL(allThreats, query);

  const graphThreats = useMemo(() => filteredThreats.slice(0, 15), [filteredThreats]);

  // Logic: Auto-fill query based on module selection, but respect initial query
  useEffect(() => {
    if (initialQuery) {
        setQuery(initialQuery);
        return;
    }
     switch(activeModule) {
         case 'APTs': setQuery('threatActor:APT OR threatActor:Bear'); break;
         case 'Malware': setQuery('type:Malware OR type:"File Hash"'); break;
         case 'Phishing': setQuery('type:URL OR tags:Phishing'); break;
         case 'Ransomware': setQuery('tags:Ransomware OR severity:CRITICAL'); break;
         case 'Critical': setQuery('severity:CRITICAL AND confidence > 80'); break;
         case 'Manage IoCs': setQuery(''); break;
         default: setQuery(''); break;
     }
  }, [activeModule, initialQuery]);

  return {
    modules,
    activeModule,
    setActiveModule,
    query,
    setQuery,
    filteredThreats,
    graphThreats,
    searchError
  };
};
