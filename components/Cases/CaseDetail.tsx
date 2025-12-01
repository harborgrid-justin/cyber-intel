
import React, { useState } from 'react';
import { Case, Threat, Artifact, IncidentReport } from '../../types';
import SubModuleNav from '../Shared/SubModuleNav';
import FeedItem from '../Feed/FeedItem';
import NetworkGraph from '../Shared/NetworkGraph';
import EvidenceManager from './EvidenceManager';
import WorkflowModal from './WorkflowModal';
import CaseTicketView from './Views/CaseTicketView';
import CaseCoordinationView from './Views/CaseCoordinationView';
import CaseReportsView from './Views/CaseReportsView';
import CaseTimelineView from './Views/CaseTimelineView';
import { threatData } from '../../services/dataLayer';
import { Button, Badge } from '../Shared/UI';
import { DetailViewHeader } from '../Shared/Layouts';
import { MOCK_AUDIT_LOGS } from '../../constants';

interface CaseDetailProps {
  activeCase: Case; linkedThreats: Threat[]; activeModule: string;
  onModuleChange: (m: string) => void; onBack: () => void; modules: string[]; onUpdate: () => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({ activeCase, linkedThreats, activeModule, onModuleChange, onBack, modules, onUpdate }) => {
  const [comment, setComment] = useState('');
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);

  const handleTransfer = (agency: string) => { threatData.transferCase(activeCase.id, agency); onUpdate(); };
  const handleShare = (agency: string) => { threatData.shareCase(activeCase.id, agency); onUpdate(); };
  const handleAddTask = (title: string, dependsOn: string[] = []) => { threatData.addTask(activeCase.id, { id: `TASK-${Date.now()}`, title, status: 'PENDING', dependsOn }); onUpdate(); };
  const toggleTask = (tid: string) => { threatData.toggleTask(activeCase.id, tid); onUpdate(); };
  const handleAddArtifact = (a: Artifact) => { threatData.addArtifact(activeCase.id, a); onUpdate(); };
  const handleDeleteArtifact = (aid: string) => { threatData.deleteArtifact(activeCase.id, aid); onUpdate(); };
  const handleApplyPlaybook = (pbId: string) => { threatData.applyPlaybook(activeCase.id, pbId); setShowWorkflowModal(false); onUpdate(); };
  const handleComment = () => { if(comment) { threatData.addNote(activeCase.id, comment); setComment(''); onUpdate(); }};
  
  const handleGenerateReport = (type: IncidentReport['type']) => {
    threatData.addReport({
      id: `RPT-${Date.now()}`, title: `${type} Report: ${activeCase.title}`, type, date: new Date().toLocaleDateString(),
      author: 'Analyst.Me', status: 'DRAFT', content: `Report for case ${activeCase.id}.`, relatedCaseId: activeCase.id
    });
    onUpdate();
  };

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full relative shadow-2xl">
      <WorkflowModal isOpen={showWorkflowModal} onClose={() => setShowWorkflowModal(false)} onApply={handleApplyPlaybook} />
      <DetailViewHeader 
        title={activeCase.title} subtitle={activeCase.id} onBack={onBack}
        tags={<><Badge color={activeCase.agency === 'SENTINEL_CORE' ? 'blue' : 'purple'}>{activeCase.agency}</Badge></>}
        actions={<><Button variant="secondary" className="px-3 py-1 text-[10px]">EDIT</Button><Button onClick={() => setShowWorkflowModal(true)} variant="primary" className="px-3 py-1 text-[10px]">WORKFLOW</Button></>}
      />
      <SubModuleNav modules={modules} activeModule={activeModule} onChange={onModuleChange} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 scroll-smooth">
        <div className="flex-1 space-y-6">
          {activeModule === 'Ticket' && <CaseTicketView activeCase={activeCase} onAddTask={handleAddTask} onToggleTask={toggleTask} comment={comment} setComment={setComment} onPostComment={handleComment} />}
          {activeModule === 'Timeline' && <CaseTimelineView activeCase={activeCase} />}
          {activeModule === 'Coordination' && <CaseCoordinationView activeCase={activeCase} onTransfer={handleTransfer} onShare={handleShare} />}
          {activeModule === 'Intelligence' && (linkedThreats.length > 0 ? <><NetworkGraph threats={linkedThreats} /><div className="space-y-2 mt-4">{linkedThreats.map(t => <FeedItem key={t.id} threat={t} />)}</div></> : <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-lg text-slate-500">No threats currently linked to this case.</div>)}
          {activeModule === 'Evidence' && <EvidenceManager artifacts={activeCase.artifacts} onAdd={handleAddArtifact} onDelete={handleDeleteArtifact} />}
          {activeModule === 'Reports' && <CaseReportsView caseId={activeCase.id} onGenerate={handleGenerateReport} />}
          {activeModule === 'Audit' && <div className="space-y-2">{MOCK_AUDIT_LOGS.map(l => <div key={l.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center"><div className="text-xs text-cyan-500 font-mono mb-0.5">{l.timestamp} - {l.user}</div><div className="text-sm text-slate-300 font-bold">{l.action}</div></div>)}</div>}
        </div>
        <div className="lg:w-80 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-5 shadow-sm">
             <div><span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Status</span><span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${activeCase.status === 'OPEN' ? 'text-green-400 border-green-900 bg-green-900/20' : 'text-slate-300 border-slate-700 bg-slate-800'}`}>{activeCase.status.replace('_',' ')}</span></div>
             <div><span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Assignee</span><div className="flex items-center gap-2"><div className="w-6 h-6 bg-cyan-900 rounded-full flex items-center justify-center text-[10px] text-cyan-200 border border-cyan-700">AD</div><span className="text-sm text-cyan-400 font-bold">{activeCase.assignee}</span></div></div>
             <div className="pt-4 border-t border-slate-800"><span className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Labels</span><div className="flex flex-wrap gap-1.5">{activeCase.labels?.length > 0 ? activeCase.labels.map(l => <span key={l} className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded border border-slate-700">{l}</span>) : <span className="text-xs text-slate-600 italic">No labels</span>}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CaseDetail;
