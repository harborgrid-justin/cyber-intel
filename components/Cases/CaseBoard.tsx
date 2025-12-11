
import React from 'react';
import { useCaseBoard } from '../../hooks/modules/useCaseBoard';
import { threatData } from '../../services/dataLayer';
import { View, Case } from '../../types';
import CaseList from './CaseList';
import CaseDetail from './CaseDetail';
import CreateCaseForm from './CreateCaseForm';
import { MasterDetailLayout, StandardPage } from '../Shared/Layouts';
import KanbanBoard from '../Shared/KanbanBoard';
import { CaseBoardActions } from './CaseBoardActions';
import { Icons } from '../Shared/Icons';

interface CaseBoardProps { initialId?: string; }

const CaseBoard: React.FC<CaseBoardProps> = ({ initialId }) => {
  const {
    boardModules, boardModule, setBoardModule,
    activeDetailModule, setActiveDetailModule,
    viewMode, setViewMode,
    selectedId, setSelectedId,
    isCreating, setIsCreating,
    cases, filteredCases, selectedCase, linkedThreats,
    handleCreateSubmit, handleKanbanDrop
  } = useCaseBoard(initialId);

  const handleReprioritize = () => {
    threatData.reprioritizeCases();
    alert("Cases re-prioritized based on linked threat intelligence.");
  };

  const handleSelect = (id: string) => { setSelectedId(id); setIsCreating(false); };

  const actions = (
      <CaseBoardActions 
        onReprioritize={handleReprioritize} 
        onCreate={() => { setIsCreating(true); setViewMode('LIST'); }} 
        viewMode={viewMode} setViewMode={setViewMode} 
      />
  );

  const kanbanColumns = [
    { id: 'OPEN', title: 'Open Intake' }, { id: 'IN_PROGRESS', title: 'Investigation' },
    { id: 'PENDING_REVIEW', title: 'Review / Legal' }, { id: 'CLOSED', title: 'Archived' }
  ];

  if (viewMode === 'KANBAN' && !isCreating && !selectedId) {
    return (
      <StandardPage title="Case Operations" subtitle="Active Investigations & Workflows" actions={actions} modules={boardModules} activeModule={boardModule} onModuleChange={setBoardModule}>
        <div className="flex-1 h-full overflow-hidden flex flex-col p-2">
           <KanbanBoard<Case>
             columns={kanbanColumns} items={filteredCases} groupBy={c => c.status} getItemId={c => c.id} onDrop={handleKanbanDrop}
             renderCard={c => (
               <div onClick={() => { handleSelect(c.id); setViewMode('LIST'); }} className="p-3 rounded-lg border bg-[var(--colors-surfaceRaised)] cursor-pointer hover:border-[var(--colors-primary)]">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-[var(--colors-textSecondary)] font-mono font-bold">{c.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${c.priority === 'CRITICAL' ? 'bg-red-900/50 text-red-500 border-red-900' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{c.priority}</span>
                 </div>
                 <div className="text-sm font-bold text-[var(--colors-textPrimary)] line-clamp-2 mb-3">{c.title}</div>
               </div>
             )}
           />
        </div>
      </StandardPage>
    );
  }

  return (
    <MasterDetailLayout
      title="Case Management" subtitle="Investigations & Response Workflows"
      isDetailOpen={!!selectedId || isCreating} onBack={() => { setSelectedId(null); setIsCreating(false); }}
      actions={actions} modules={['Case Database']} activeModule={'Case Database'} onModuleChange={() => {}}
      listContent={<div className="flex flex-col h-full gap-4"><CaseList cases={cases} selectedId={selectedId} onSelect={handleSelect} /></div>}
      detailContent={
        isCreating ? ( <CreateCaseForm onCancel={() => setIsCreating(false)} onSubmit={handleCreateSubmit} /> ) 
        : selectedCase ? (
          <CaseDetail 
            activeCase={selectedCase} linkedThreats={linkedThreats} activeModule={activeDetailModule} 
            onModuleChange={setActiveDetailModule} onBack={() => setSelectedId(null)} modules={threatData.getModulesForView(View.CASES)} onUpdate={() => {}} 
          />
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center text-[var(--colors-textTertiary)] border border-[var(--colors-borderDefault)] rounded-xl bg-[var(--colors-surfaceDefault)] m-4">
             <div className="w-20 h-20 rounded-full bg-[var(--colors-surfaceHighlight)] flex items-center justify-center mb-6 ring-4 ring-[var(--colors-surfaceRaised)]"><Icons.Layers className="w-10 h-10" /></div>
             <span className="uppercase tracking-[0.2em] font-bold text-sm">Case Files Locked</span>
          </div>
        )
      }
    />
  );
};
export default CaseBoard;
