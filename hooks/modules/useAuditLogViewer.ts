
import { useState, useMemo, useCallback } from 'react';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../useDataStore';
import { AuditLogic } from '../../services/logic/AuditLogic';

export const useAuditLogViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('ALL');

  const logs = useDataStore(() => threatData.getAuditLogs());

  const filteredLogs = useMemo(() => {
    return AuditLogic.filterLogs(logs, timeFilter, searchTerm);
  }, [logs, timeFilter, searchTerm]);

  const handleExport = useCallback(() => {
    const { url, filename } = threatData.logStore.generateExport();
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.dispatchEvent(new CustomEvent('notification', { detail: { title: 'Export Started', message: `Downloading ${filename}`, type: 'info' } }));
  }, []);

  return {
    searchTerm, setSearchTerm,
    timeFilter, setTimeFilter,
    filteredLogs,
    handleExport,
  };
};
