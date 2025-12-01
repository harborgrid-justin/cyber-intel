
import React, { useState, useEffect, useMemo } from 'react';
import { threatData } from '../../services/dataLayer';
import CaseList from './CaseList';
import CaseDetail from './CaseDetail';
import CreateCaseForm from './CreateCaseForm';
import { MasterDetailLayout, StandardPage } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import KanbanBoard from '../Shared/KanbanBoard';
import { Case } from '../../types';
import { Button, FilterGroup } from '../Shared/UI';

interface CaseBoardProps {
  initialId?: string;
}

const CaseBoard: React.FC<CaseBoardProps> = ({ initialId }) => {
  const [boardModule, setBoardModule] = useState(CONFIG.MODULES.CASE_BOARD[0]);
  const [activeDetailModule, setActiveDetailModule] = useState(CONFIG.MODULES.CASES[0]);
  const [viewMode, setViewMode] = useState<'LIST' | 'KANBAN'>('LIST'); 
  const [cases, setCases] = useState<Case[]>(threatData.getCases());
  const [selectedId, setSelectedId] = useState<string | null>(initialId || null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (initialId) {
      setSelectedId(initialId);
      setViewMode('LIST');
    }
  }, [initialId]);

  const selectedCase = useMemo(() => cases.find(c => c.id === selectedId), [cases, selectedId]);
  
  const linkedThreats = useMemo(() => {
    return selectedCase 
      ? threatData.getThreats(false).filter(t => selectedCase.relatedThreatIds.includes(t.id)) 
      : [];
  }, [selectedCase]);

  const handleRefresh = () => { 
    setCases(threatData.getCases()); 
    if (selectedId && !threatData.getCase(selectedId)) setSelectedId(null);
  };

  const handleReprioritize = () => {
    threatData.reprioritizeCases();
    handleRefresh();
    alert("Cases re-prioritized based on linked threat intelligence.");
  };

  const handleSelect = (id: string) => { setSelectedId(id); setIsCreating(false); };
  
  const handleCreateSubmit = (newCase: Case) => {
    threatData.addCase(newCase);
    handleRefresh();
    setIsCreating(false);
    setSelectedId(newCase.id);
    setViewMode('LIST');
  };

  const handleKanbanDrop = (id: string, newStatus: string) => {
    const c = cases.find(x => x.id === id);
    if (c && c.status !== newStatus) {
      // Safe cast because Kanban columns match Status enum
      threatData.updateCase({ ...c, status: newStatus as Case['status'] });
      handleRefresh();
    }
  };

  const filteredCases = useMemo(() => {
    if (viewMode === 'LIST') return cases;
    switch (boardModule) {
      case 'My Tickets': return cases.filter(c => c.assignee === CONFIG.USER.NAME || c.assignee === 'Me');
      case 'Critical Watch': return cases.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH');
      case 'Pending Review': return cases.filter(c => c.status === 'PENDING_REVIEW');
      default: return cases;
    }
  }, [cases, viewMode, boardModule]);

  const kanbanColumns = [
    { id: 'OPEN', title: 'Open' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'PENDING_REVIEW', title: 'Pending Review' },
    { id: 'CLOSED', title: 'Closed' }
  ];

  const Actions = () => (
    <div className="flex gap-4 shrink-0 items-center">
       <Button onClick={() => { setIsCreating(true); setViewMode('LIST'); }} variant="primary" className="text-sm">+ Ticket</Button>
       <Button onClick={handleReprioritize} variant="secondary" className="text-amber-500">⚡ AI Priority</Button>
       <FilterGroup 
         value={viewMode}
         onChange={(v) => setViewMode(v as any)}
         options={[
           { label: 'List View', value: 'LIST' },
           { label: 'Board View', value: 'KANBAN' }
         ]}
         className="ml-2"
       />
    </div>
  );

  if (viewMode === 'KANBAN' && !isCreating && !selectedId) {
    return (
      <StandardPage 
        title="Case Management" 
        subtitle="Kanban Board & Operational Status"
        actions={<Actions />}
        modules={CONFIG.MODULES.CASE_BOARD}
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
               <div onClick={() => { handleSelect(c.id); setViewMode('LIST'); }} className="bg-slate-900 border border-slate-700 p-3 rounded cursor-pointer hover:border-cyan-500 transition-all shadow-sm group">
                 <div className="flex justify-between mb-2">
                    <span className="text-[10px] text-cyan-500 font-mono group-hover:text-cyan-400">{c.id}</span>
                    <span className={`text-[10px] px-1.5 rounded font-bold ${c.priority === 'CRITICAL' ? 'bg-red-900 text-red-400' : 'bg-slate-800 text-slate-400'}`}>{c.priority}</span>
                 </div>
                 <div className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-cyan-100">{c.title}</div>
                 <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>{c.assignee}</span>
                    <span className="bg-slate-950 px-1 rounded">{c.agency}</span>
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
      actions={<Actions />}
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
            modules={CONFIG.MODULES.CASES} 
            onUpdate={handleRefresh} 
          />
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900/50">
             <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
               <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
             </div>
             <span className="uppercase tracking-widest font-bold text-sm">Select a ticket to view details</span>
             <p className="text-xs text-slate-600 mt-2">Or click "+ Ticket" to start a new investigation.</p>
          </div>
        )
      }
    />
  );
};
export default CaseBoard;
