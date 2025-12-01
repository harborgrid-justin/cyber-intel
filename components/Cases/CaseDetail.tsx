
import React, { useState, useMemo, useEffect } from 'react';
import { Case, Threat, Artifact, IncidentReport, View } from '../../types';
import SubModuleNav from '../Shared/SubModuleNav';
import FeedItem from '../Feed/FeedItem';
import NetworkGraph from '../Shared/NetworkGraph';
import EvidenceManager from './EvidenceManager';
import WorkflowModal from './WorkflowModal';
import CaseWorkbenchView from './Views/CaseTicketView';
import CaseCoordinationView from './Views/CaseCoordinationView';
import CaseReportsView from './Views/CaseReportsView';
import KillChainView from './Views/KillChainView';
import CaseLinksView from './Views/CaseLinksView';
import { threatData } from '../../services/dataLayer';
import { Button, Badge, Card, CardHeader } from '../Shared/UI';
import { DetailViewHeader } from '../Shared/Layouts';

interface CaseDetailProps {
  activeCase: Case; linkedThreats: Threat[]; activeModule: string;
  onModuleChange: (m: string) => void; onBack: () => void; modules: string[]; onUpdate: () => void;
}

const CONSOLIDATED_TABS = ['Workbench', 'Intelligence', 'Linked Cases', 'Response', 'Evidence'];

const CaseDetail: React.FC<CaseDetailProps> = ({ activeCase, linkedThreats, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(CONSOLIDATED_TABS[0]);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  
  // Handle internal navigation for case links
  useEffect(() => {
    const handleCaseSwitch = (e: Event) => {
        const customEvent = e as CustomEvent;
        // This is a bit of a hack to switch the active case within the CaseBoard context
        // Ideally this would be handled by the parent, but this works for local navigation
        if (customEvent.detail?.id && customEvent.detail.id !== activeCase.id) {
             // We dispatch app-navigation which CaseBoard listens to implicitly via App.tsx but CaseBoard also needs to update local state
             window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.CASES, id: customEvent.detail.id } }));
        }
    };
    window.addEventListener('case-selected', handleCaseSwitch);
    return () => window.removeEventListener('case-selected', handleCaseSwitch);
  }, [activeCase.id]);

  // Filter audit logs relevant to this case
  const caseLogs = useMemo(() => {
    return threatData.getAuditLogs().filter(l => 
        l.details.includes(activeCase.id) || 
        l.details.includes(activeCase.title) || 
        l.action.includes('CASE') ||
        activeCase.artifacts.some(a => l.details.includes(a.name))
    );
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

  const handleGenerateReport = (type: IncidentReport['type']) => {
    threatData.addReport({
      id: `RPT-${Date.now()}`, title: `${type} Report: ${activeCase.title}`, type, date: new Date().toLocaleDateString(),
      author: 'Analyst.Me', status: 'DRAFT', content: `Report for case ${activeCase.id}.`, relatedCaseId: activeCase.id
    });
    onUpdate();
  };

  return (
    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full relative shadow-2xl">
      <WorkflowModal isOpen={showWorkflowModal} onClose={() => setShowWorkflowModal(false)} onApply={handleApplyPlaybook} />
      
      <DetailViewHeader 
        title={activeCase.title} subtitle={activeCase.id} onBack={onBack}
        tags={<><Badge color={activeCase.agency === 'SENTINEL_CORE' ? 'blue' : 'purple'}>{activeCase.agency}</Badge><Badge color={activeCase.status === 'OPEN' ? 'green' : 'slate'}>{activeCase.status}</Badge></>}
        actions={<><Button variant="secondary" className="px-3 py-1 text-[10px]">EDIT</Button><Button onClick={() => setShowWorkflowModal(true)} variant="primary" className="px-3 py-1 text-[10px]">WORKFLOW</Button></>}
      />
      
      <SubModuleNav modules={CONSOLIDATED_TABS} activeModule={activeTab} onChange={setActiveTab} />
      
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col gap-6">
                        <KillChainView threats={linkedThreats} />
                        <Card className="flex-1 p-0 overflow-hidden min-h-[300px]">
                            <CardHeader title="Relationship Graph" />
                            <div className="p-4 flex items-center justify-center bg-slate-950/50 h-full">
                                <NetworkGraph threats={linkedThreats} />
                            </div>
                        </Card>
                    </div>
                    <Card className="p-0 overflow-hidden flex flex-col h-full max-h-[800px]">
                        <CardHeader title="Linked Indicators (IoCs)" action={<Badge color="red">{linkedThreats.length} Items</Badge>} />
                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2 bg-slate-900/30">
                            {linkedThreats.length > 0 ? linkedThreats.map(t => <FeedItem key={t.id} threat={t} />) : <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-lg text-slate-500">No threats currently linked to this case.<br/><span className="text-xs">Use "Add Artifact" or link from Feed.</span></div>}
                        </div>
                    </Card>
                </div>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CaseCoordinationView activeCase={activeCase} onTransfer={handleTransfer} onShare={handleShare} />
                    <Card className="p-0 overflow-hidden">
                        <CardHeader title="Reporting Center" />
                        <div className="p-6">
                            <CaseReportsView caseId={activeCase.id} onGenerate={handleGenerateReport} />
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'Evidence' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <EvidenceManager artifacts={activeCase.artifacts} onAdd={handleAddArtifact} onDelete={handleDeleteArtifact} />
                    <Card className="p-0 overflow-hidden">
                        <CardHeader title="Case Audit Trail" action={<Badge color="slate">{caseLogs.length} Events</Badge>} />
                        <div className="p-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {caseLogs.length > 0 ? caseLogs.slice(0, 15).map(l => (
                                <div key={l.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center group hover:border-slate-700 transition-colors">
                                    <div className="flex gap-3 items-center">
                                        <div className="text-[10px] text-slate-500 font-mono">{l.timestamp}</div>
                                        <div className="text-xs text-cyan-500 font-bold">{l.action}</div>
                                    </div>
                                    <div className="text-xs text-slate-400 group-hover:text-white max-w-md truncate">{l.details}</div>
                                    <div className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-500">{l.user}</div>
                                </div>
                            )) : <div className="text-center text-slate-500 italic py-4">No audit logs recorded for this case yet.</div>}
                        </div>
                    </Card>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
export default CaseDetail;
