
import { useState, useEffect, useMemo, useCallback } from 'react';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../useDataStore';
import { apiClient } from '../../services/apiClient';
import { View, IncidentReport } from '../../types';

export const useReportsLogic = (initialId?: string) => {
  const modules = useMemo(() => threatData.getModulesForView(View.REPORTS), []);
  const [activeModule, setActiveModule] = useState(modules[0]);
  
  // Data Subscription
  const reports = useDataStore(() => threatData.getReports());
  
  // Local UI State
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(initialId || null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch Templates (Server State)
  useEffect(() => {
    let mounted = true;
    apiClient.get<any[]>('/reports/templates').then(data => {
        if (mounted) setTemplates(data);
    }).catch(() => {}); // Silent fail or toast
    return () => { mounted = false; };
  }, []);

  // Deep Link Handling
  useEffect(() => {
    if (initialId) {
      setSelectedReportId(initialId);
      setActiveModule('Library');
    }
  }, [initialId]);

  const handleSave = useCallback(() => {
    setIsCreating(false);
    setSelectedReportId(null);
    setActiveModule('Library');
  }, []);

  const filteredReports = useMemo(() => {
    return reports
      .filter(r => statusFilter === 'ALL' || r.status === statusFilter)
      .filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [reports, statusFilter, searchTerm]);

  const selectedReport = useMemo(() => 
    reports.find(r => r.id === selectedReportId), 
  [reports, selectedReportId]);

  return {
    modules,
    activeModule,
    setActiveModule,
    templates,
    selectedReportId,
    setSelectedReportId,
    isCreating,
    setIsCreating,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredReports,
    selectedReport,
    handleSave
  };
};
