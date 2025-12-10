
import React, { useState, useEffect, useMemo } from 'react';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import CaseList from './CaseList';
import CaseDetail from './CaseDetail';
import CreateCaseForm from './CreateCaseForm';
import { MasterDetailLayout, StandardPage } from '../Shared/Layouts';
import KanbanBoard from '../Shared/KanbanBoard';
import { Case, View } from '../../types';
import { CaseBoardActions } from './CaseBoardActions';
import { Icons } from '../Shared/Icons';

interface CaseBoardProps {
  initialId?: string;
}

const CaseBoard: React.FC<CaseBoardProps> = ({ initialId }) => {
  const boardModules = useMemo(() => threatData.getModulesForView(View.CASES), []);
  const [boardModule, setBoardModule] = useState(boardModules[0]);
  const [activeDetailModule, setActiveDetailModule] = useState(threatData.getModulesForView(View.CASES)[0]);
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

  const handleReprioritize = () => {
    threatData.reprioritizeCases();
    alert("Cases re-prioritized based on linked threat intelligence.");
  };

  const handleSelect = (id: string) => { setSelectedId(id); setIsCreating(false); };
  
  const handleCreateSubmit = (newCase: Case) => {
    threatData.addCase(newCase);
    setIsCreating(false);
    setSelectedId(newCase.id);
    setViewMode('LIST');
  };

  const handleKanbanDrop = (id: string, newStatus: string) => {
    const c = cases.find(x => x.id === id);
    if (c && c.status !== newStatus) {
      threatData.updateCase({ ...c, status: newStatus as Case['status'] });
    }
  };

  const filteredCases = useMemo(() => {
    if (viewMode === 'LIST') return cases;
    switch (boardModule) {
      case 'My Tickets': 
        return cases.filter(c => c.assignee === currentUser?.name || c.assignee === 'Me');
      case 'Critical Watch': 
        return cases.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH');
      case 'Pending Review': 
        return cases.filter(c => c.status === 'PENDING_REVIEW');
      default: 
        return cases;
    }
  }, [cases, viewMode, boardModule, currentUser]);

  const kanbanColumns = [
    { id: 'OPEN', title: 'Open Intake' },
    { id: 'IN_PROGRESS', title: 'Investigation' },
    { id: 'PENDING_REVIEW', title: 'Review / Legal' },
    { id: 'CLOSED', title: 'Archived' }
  ];

  const actions = (
      <CaseBoardActions 
        onReprioritize={handleReprioritize} 
        onCreate={() => { setIsCreating(true); setViewMode('LIST'); }} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
      />
  );

  if (viewMode === 'KANBAN' && !isCreating && !selectedId) {
    return (
      <StandardPage 
        title="Case Operations" 
        subtitle="Active Investigations & Workflows"
        actions={actions}
        modules={boardModules}
        activeModule={boardModule}
        onModuleChange={setBoardModule}
      >
        <div className="flex-1 h-full overflow-hidden flex flex-col p-2">
           <KanbanBoard<Case>
             columns={kanbanColumns}
             items={filteredCases}
             groupBy={c => c.status}
             getItemId={c => c.id}
             onDrop={handleKanbanDrop}
             renderCard={c => (
               <div 
                 onClick={() => { handleSelect(c.id); setViewMode('LIST'); }} 
                 className={`
                    p-3 rounded-lg border bg-[var(--colors-surfaceRaised)] backdrop-blur-sm shadow-sm cursor-pointer group transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
                    ${c.priority === 'CRITICAL' ? 'border-[var(--colors-critical)]/50 hover:border-[var(--colors-critical)]' : c.priority === 'HIGH' ? 'border-[var(--colors-high)]/50 hover:border-[var(--colors-high)]' : 'border-[var(--colors-borderDefault)] hover:border-[var(--colors-primary)]'}
                 `}
               >
                 <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5">
                        <Icons.Layers className="w-3 h-3 text-[var(--colors-textTertiary)]" />
                        <span className="text-[10px] text-[var(--colors-textSecondary)] font-mono font-bold">{c.id}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${c.priority === 'CRITICAL' ? 'bg-[var(--colors-criticalDim)] text-[var(--colors-critical)] border-[var(--colors-critical)]/50' : 'bg-[var(--colors-surfaceDefault)] text-[var(--colors-textSecondary)] border-[var(--colors-borderDefault)]'}`}>
                        {c.priority}
                    </span>
                 </div>
                 <div className="text-sm font-bold text-[var(--colors-textPrimary)] line-clamp-2 mb-3 group-hover:text-white transition-colors">{c.title}</div>
                 
                 <div className="flex justify-between items-center text-[10px] text-[var(--colors-textSecondary)] pt-2 border-t border-[var(--colors-borderDefault)]">
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-[var(--colors-surfaceHighlight)] flex items-center justify-center text-[8px] font-bold text-[var(--colors-textPrimary)]">{c.assignee.charAt(0)}</div>
                        <span className="truncate max-w-[80px]">{c.assignee}</span>
                    </div>
                    {c.slaBreach && <span className="text-[var(--colors-error)] font-bold animate-pulse">SLA!</span>}
                 </div>
               </div>
             )}
           />
        </div>
      </StandardPage>
    );
  }

  return (
    <MasterDetailLayout
      title="Case Management"
      subtitle="Investigations & Response Workflows"
      isDetailOpen={!!selectedId || isCreating}
      onBack={() => { setSelectedId(null); setIsCreating(false); }}
      actions={actions}
      modules={['Case Database']}
      activeModule={'Case Database'}
      onModuleChange={() => {}}
      listContent={
        <div className="flex flex-col h-full gap-4">
          <CaseList cases={cases} selectedId={selectedId} onSelect={handleSelect} />
        </div>
      }
      detailContent={
        isCreating ? (
          <CreateCaseForm onCancel={() => setIsCreating(false)} onSubmit={handleCreateSubmit} />
        ) : selectedCase ? (
          <CaseDetail 
            activeCase={selectedCase} 
            linkedThreats={linkedThreats} 
            activeModule={activeDetailModule} 
            onModuleChange={setActiveDetailModule} 
            onBack={() => setSelectedId(null)} 
            modules={threatData.getModulesForView(View.CASES)} 
            onUpdate={() => {}} 
          />
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center text-[var(--colors-textTertiary)] border border-[var(--colors-borderDefault)] rounded-xl bg-[var(--colors-surfaceDefault)] m-4">
             <div className="w-20 h-20 rounded-full bg-[var(--colors-surfaceHighlight)] flex items-center justify-center mb-6 ring-4 ring-[var(--colors-surfaceRaised)]">
               <Icons.Layers className="w-10 h-10 text-[var(--colors-textTertiary)]" />
             </div>
             <span className="uppercase tracking-[0.2em] font-bold text-sm">Case Files Locked</span>
             <p className="text-xs text-[var(--colors-textTertiary)] mt-2 font-mono">Select a file from the registry to view dossier</p>
          </div>
        )
      }
    />
  );
};
export default CaseBoard;