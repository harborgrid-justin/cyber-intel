
import React, { useState, useEffect, useMemo } from 'react';
import { Case, Threat, Artifact, IncidentReport, View, Playbook } from '../../types';
import SubModuleNav from '../Shared/SubModuleNav';
import WorkflowModal from './WorkflowModal';
import CaseWorkbenchView from './Views/CaseTicketView';
import CaseLinksView from './Views/CaseLinksView';
import CaseResponseView from './Views/CaseResponseView';
import CaseIntelligenceView from './Views/CaseIntelligenceView';
import CaseEvidenceView from './Views/CaseEvidenceView';
import { threatData } from '../../services/dataLayer';
import { Button, Badge } from '../Shared/UI';
import { DetailViewHeader } from '../Shared/Layouts';
import { CaseLogic } from '../../services/logic/CaseLogic';

interface CaseDetailProps {
  activeCase: Case; linkedThreats: Threat[]; activeModule: string;
  onModuleChange: (m: string) => void; onBack: () => void; modules: string[]; onUpdate: () => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({ activeCase, linkedThreats, onBack, onUpdate }) => {
  const modules = useMemo(() => threatData.getModulesForView(View.CASES), []);
  const [activeTab, setActiveTab] = useState(modules[0]);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [suggestedPlaybook, setSuggestedPlaybook] = useState<Playbook | null>(null);
  
  // Handle internal navigation for case links
  useEffect(() => {
    const handleCaseSwitch = (e: Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail?.id && customEvent.detail.id !== activeCase.id) {
             window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.CASES, id: customEvent.detail.id } }));
        }
    };
    window.addEventListener('case-selected', handleCaseSwitch);
    return () => window.removeEventListener('case-selected', handleCaseSwitch);
  }, [activeCase.id]);

  useEffect(() => {
    const fetchSuggestion = async () => {
        const pb = await CaseLogic.suggestPlaybook(activeCase, threatData.getPlaybooks());
        setSuggestedPlaybook(pb);
    };
    fetchSuggestion();
  }, [activeCase]);

  const handleTransfer = (agency: string) => { threatData.transferCase(activeCase.id, agency); onUpdate(); };
  const handleShare = (agency: string) => { threatData.shareCase(activeCase.id, agency); onUpdate(); };
  const handleAddTask = (title: string, dependsOn: string[] = []) => { threatData.addTask(activeCase.id, { id: `TASK-${Date.now()}`, title, status: 'PENDING', dependsOn }); onUpdate(); };
  const toggleTask = (tid: string) => { threatData.toggleTask(activeCase.id, tid); onUpdate(); };
  const handleAddArtifact = (a: Artifact) => { threatData.addArtifact(activeCase.id, a); onUpdate(); };
  const handleDeleteArtifact = (aid: string) => { threatData.deleteArtifact(activeCase.id, aid); onUpdate(); };
  const handleApplyPlaybook = (pbId: string) => { threatData.applyPlaybook(activeCase.id, pbId); setShowWorkflowModal(false); onUpdate(); };
  const handleComment = (c: string) => { if(c) { threatData.addNote(activeCase.id, c); onUpdate(); }};
  
  const handleLinkCase = (targetId: string) => { threatData.linkCases(activeCase.id, targetId); onUpdate(); };
  const handleUnlinkCase = (targetId: string) => { threatData.unlinkCases(activeCase.id, targetId); onUpdate(); };

  return (
    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full relative shadow-2xl">
      <WorkflowModal isOpen={showWorkflowModal} onClose={() => setShowWorkflowModal(false)} onApply={handleApplyPlaybook} />
      
      <DetailViewHeader 
        title={activeCase.title} subtitle={activeCase.id} onBack={onBack}
        tags={<><Badge color={activeCase.agency === 'SENTINEL_CORE' ? 'blue' : 'purple'}>{activeCase.agency}</Badge><Badge color={activeCase.status === 'OPEN' ? 'green' : 'slate'}>{activeCase.status}</Badge></>}
        actions={
            <>
                {suggestedPlaybook && <Button onClick={() => handleApplyPlaybook(suggestedPlaybook.id)} variant="secondary" className="px-3 py-1 text-[10px] text-yellow-400 border-yellow-900/50">SUGGESTED: {suggestedPlaybook.name}</Button>}
                <Button variant="secondary" className="px-3 py-1 text-[10px]">EDIT</Button>
                <Button onClick={() => setShowWorkflowModal(true)} variant="primary" className="px-3 py-1 text-[10px]">WORKFLOW</Button>
            </>
        }
      />
      
      <SubModuleNav modules={modules} activeModule={activeTab} onChange={setActiveTab} />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900/30 scroll-smooth">
        <div className="max-w-7xl mx-auto h-full">
            
            {activeTab === 'Workbench' && (
                <CaseWorkbenchView 
                    activeCase={activeCase} 
                    onAddTask={handleAddTask} 
                    onToggleTask={toggleTask} 
                    onPostComment={handleComment} 
                />
            )}

            {activeTab === 'Intelligence' && (
                <CaseIntelligenceView activeCase={activeCase} linkedThreats={linkedThreats} />
            )}

            {activeTab === 'Linked Cases' && (
                <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CaseLinksView 
                        activeCase={activeCase}
                        onLink={handleLinkCase}
                        onUnlink={handleUnlinkCase}
                    />
                </div>
            )}

            {activeTab === 'Response' && (
                <CaseResponseView 
                    activeCase={activeCase}
                    onTransfer={handleTransfer}
                    onShare={handleShare}
                    onGenerateReport={() => onUpdate()}
                />
            )}

            {activeTab === 'Evidence' && (
                <CaseEvidenceView 
                    activeCase={activeCase}
                    onAddArtifact={handleAddArtifact}
                    onDeleteArtifact={handleDeleteArtifact}
                />
            )}

        </div>
      </div>
    </div>
  );
};
export default CaseDetail;
