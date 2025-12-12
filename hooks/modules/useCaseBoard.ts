
import { useState, useEffect, useMemo, useCallback } from 'react';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../useDataStore';
import { View, Case, Threat, SystemUser } from '../../types';

export interface UseCaseBoardResult {
  boardModules: string[];
  boardModule: string;
  setBoardModule: (module: string) => void;
  activeDetailModule: string;
  setActiveDetailModule: (module: string) => void;
  viewMode: 'LIST' | 'KANBAN';
  setViewMode: (mode: 'LIST' | 'KANBAN') => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  isCreating: boolean;
  setIsCreating: (creating: boolean) => void;
  cases: Case[];
  filteredCases: Case[];
  selectedCase: Case | undefined;
  linkedThreats: Threat[];
  handleCreateSubmit: (newCase: Case) => void;
  handleKanbanDrop: (id: string, newStatus: string) => void;
}

export const useCaseBoard = (initialId?: string): UseCaseBoardResult => {
  const boardModules = useMemo(() => threatData.getModulesForView(View.CASES), []);
  const [boardModule, setBoardModule] = useState(boardModules[0]);
  const [activeDetailModule, setActiveDetailModule] = useState(boardModules[0]);
  const [viewMode, setViewMode] = useState<'LIST' | 'KANBAN'>('LIST'); 
  const [selectedId, setSelectedId] = useState<string | null>(initialId || null);
  const [isCreating, setIsCreating] = useState(false);

  const cases = useDataStore(() => threatData.getCases());
  const currentUser = useDataStore(() => threatData.currentUser);

  useEffect(() => {
    if (initialId) {
      setSelectedId(initialId);
      setViewMode('LIST');
    }
  }, [initialId]);

  // Auto-deselect if case deleted
  useEffect(() => {
    if (selectedId && !cases.find(c => c.id === selectedId)) {
        setSelectedId(null);
    }
  }, [cases, selectedId]);

  const selectedCase = useMemo(() => cases.find(c => c.id === selectedId), [cases, selectedId]);
  
  const linkedThreats = useMemo(() => {
    return selectedCase 
      ? threatData.getThreats(false).filter(t => selectedCase.relatedThreatIds.includes(t.id)) 
      : [];
  }, [selectedCase]);

  const filteredCases = useMemo(() => {
    if (viewMode === 'LIST') return cases;
    switch (boardModule) {
      case 'My Tickets': return cases.filter(c => c.assignee === currentUser?.name || c.assignee === 'Me');
      case 'Critical Watch': return cases.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH');
      case 'Pending Review': return cases.filter(c => c.status === 'PENDING_REVIEW');
      default: return cases;
    }
  }, [cases, viewMode, boardModule, currentUser]);

  const handleCreateSubmit = useCallback((newCase: Case) => {
    threatData.addCase(newCase);
    setIsCreating(false);
    setSelectedId(newCase.id);
    setViewMode('LIST');
  }, []);

  const handleKanbanDrop = useCallback((id: string, newStatus: string) => {
    const c = cases.find(x => x.id === id);
    if (c && c.status !== newStatus) {
      threatData.updateCase({ ...c, status: newStatus as Case['status'] });
    }
  }, [cases]);

  return {
    boardModules, boardModule, setBoardModule,
    activeDetailModule, setActiveDetailModule,
    viewMode, setViewMode,
    selectedId, setSelectedId,
    isCreating, setIsCreating,
    cases, filteredCases, selectedCase, linkedThreats,
    handleCreateSubmit, handleKanbanDrop
  };
};
