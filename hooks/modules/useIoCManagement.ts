
import { useState, useEffect, useCallback } from 'react';
import { Threat, Severity, IncidentStatus, ThreatId } from '../../types';
import { threatData } from '../../services/dataLayer';
import { BloomFilter } from '../../services/algorithms/BloomFilter';

const filter = new BloomFilter(1000, 0.01);
const IOC_TYPES = ['IP Address', 'Domain', 'File Hash', 'URL', 'Email Address'];

export const useIoCManagement = () => {
  const [data, setData] = useState<Threat[]>([]);
  const [newIoC, setNewIoC] = useState('');
  const [newType, setNewType] = useState(IOC_TYPES[0]);

  useEffect(() => {
    const refresh = () => { 
      const threats = threatData.getThreats(); 
      threats.forEach(t => filter.add(t.indicator)); 
      setData(threats); 
    };
    refresh();
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, []);

  const handleDelete = useCallback((id: string) => {
    threatData.deleteThreat(id);
  }, []);

  const handleAdd = useCallback(() => {
    if (!newIoC) return;
    if (filter.test(newIoC)) { 
      if (!window.confirm(`Indicator "${newIoC}" may be a duplicate. Add anyway?`)) return; 
    }
    const t: Threat = {
      id: Date.now().toString() as ThreatId, indicator: newIoC, type: newType, severity: Severity.MEDIUM, lastSeen: 'Now',
      source: 'Analyst', description: 'Manual Entry', status: IncidentStatus.NEW, confidence: 100, region: 'Internal',
      threatActor: 'Unknown', reputation: 0, score: 50
    };
    threatData.addThreat(t);
    filter.add(newIoC);
    setNewIoC('');
  }, [newIoC, newType]);

  return {
    data, IOC_TYPES,
    newIoC, setNewIoC,
    newType, setNewType,
    handleDelete, handleAdd
  };
};
