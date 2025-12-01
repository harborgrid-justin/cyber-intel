
import React, { useState } from 'react';
import { Case, Threat, Artifact, IncidentReport } from '../../types';
import SubModuleNav from '../Shared/SubModuleNav';
import FeedItem from '../Feed/FeedItem';
import NetworkGraph from '../Shared/NetworkGraph';
import EvidenceManager from './EvidenceManager';
import WorkflowModal from './WorkflowModal';
import CaseWorkbenchView from './Views/CaseTicketView';
import CaseCoordinationView from './Views/CaseCoordinationView';
import CaseReportsView from './Views/CaseReportsView';
import KillChainView from './Views/KillChainView';
import { threatData } from '../../services/dataLayer';
import { Button, Badge, Card, CardHeader } from '../Shared/UI';
import { DetailViewHeader } from '../Shared/Layouts';

interface CaseDetailProps {
  activeCase: Case; linkedThreats: Threat[]; activeModule: string;
  onModuleChange: (m: string) => void; onBack: () => void; modules: string[]; onUpdate: () => void;
}

const CONSOLIDATED_TABS = ['Workbench', 'Intelligence', 'Response', 'Evidence'];

const CaseDetail: React.FC<CaseDetailProps> = ({ activeCase, linkedThreats, onBack, onUpdate }) => {
  const [activeTab, setActiveTab] = useState(CONSOLIDATED_TABS[0]);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const auditLogs = threatData.getAuditLogs();

  const handleTransfer = (agency: string) => { threatData.transferCase(activeCase.id, agency); onUpdate(); };
  const handleShare = (agency: string) => { threatData.shareCase(activeCase.id, agency); onUpdate(); };
  const handleAddTask = (title: string, dependsOn: string[] = []) => { threatData.addTask(activeCase.id, { id: `TASK-${Date.now()}`, title, status: 'PENDING', dependsOn }); onUpdate(); };
  const toggleTask = (tid: string) => { threatData.toggleTask(activeCase.id, tid); onUpdate(); };
  const handleAddArtifact = (a: Artifact) => { threatData.addArtifact(activeCase.id, a); onUpdate(); };
  const handleDeleteArtifact = (aid: string) => { threatData.deleteArtifact(activeCase.id, aid); onUpdate(); };
  const handleApplyPlaybook = (pbId: string) => { threatData.applyPlaybook(activeCase.id, pbId); setShowWorkflowModal(false); onUpdate(); };
  const handleComment = (c: string) => { if(c) { threatData.addNote(activeCase.id, c); onUpdate(); }};
  
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
                        <Card className="flex-1 p-0 overflow-hidden">
                            <CardHeader title="Relationship Graph" />
                            <div className="p-4 flex items-center justify-center bg-slate-950/50">
                                <NetworkGraph threats={linkedThreats} />
                            </div>
                        </Card>
                    </div>
                    <Card className="p-0 overflow-hidden flex flex-col h-full">
                        <CardHeader title="Linked Intelligence" action={<Badge color="red">{linkedThreats.length} IoCs</Badge>} />
                        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-2 bg-slate-900/30">
                            {linkedThreats.length > 0 ? linkedThreats.map(t => <FeedItem key={t.id} threat={t} />) : <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-lg text-slate-500">No threats currently linked to this case.</div>}
                        </div>
                    </Card>
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
                        <CardHeader title="Audit Log (Chain of Custody)" />
                        <div className="p-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {auditLogs.slice(0, 10).map(l => (
                                <div key={l.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                                    <div className="text-xs text-cyan-500 font-mono mb-0.5">{l.timestamp} - {l.user}</div>
                                    <div className="text-sm text-slate-300 font-bold">{l.action}</div>
                                </div>
                            ))}
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
