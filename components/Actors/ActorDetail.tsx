
import React from 'react';
import { ThreatActor, View } from '../../types';
import SubModuleNav from '../Shared/SubModuleNav';
import { threatData } from '../../services/dataLayer';
import { DetailViewHeader } from '../Shared/Layouts';
import { Button, Card, Badge } from '../Shared/UI';
import { useActorManagement } from '../../hooks/useActorManagement';
import { ActorProfile, ActorTimeline, ActorAssociations } from './ActorViews';
import { ActorTTPs, ActorCampaigns, ActorInfra, ActorExploits, ActorIndustries, ActorReferences } from './Views/ActorEditComponents';
import { ActorThreatFeeds, ActorIoCAssociations, ActorMalwareFamilies, ActorInfraDetails, ActorNetworkAnalysis } from './ActorIntelViews';

interface ActorDetailProps {
  actor: ThreatActor; activeModule: string; onModuleChange: (m: string) => void;
  onBack: () => void; modules: string[]; onUpdate: () => void;
}

const ActorDetail: React.FC<ActorDetailProps> = ({ actor, activeModule, onModuleChange, onBack, modules, onUpdate }) => {
  const { state, setters, actions } = useActorManagement(actor, onUpdate);
  const reports = threatData.getReportsByActor(actor.id);
  const linkedThreats = threatData.getThreatsByActor(actor.name);
  const malwareSamples = threatData.getMalwareSamples().filter(m => m.associatedActor === actor.name);
  const networkCaps = threatData.getNetworkCaptures().filter(p => p.associatedActor === actor.name);

  // Map hook setters to simpler prop names
  const profileActions = { 
    ...actions, 
    newAlias: state.newAlias, setAlias: setters.setNewAlias, 
    newThreatId: state.newThreatId, setThreatId: setters.setNewThreatId 
  };

  const handleViewReport = (id: string) => {
    window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.REPORTS, id } }));
  };

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
      <DetailViewHeader title={actor.name} onBack={onBack} actions={<Button onClick={actions.handleDelete} variant="danger" className="text-[10px] py-1">DELETE ACTOR</Button>} />
      <SubModuleNav modules={modules} activeModule={activeModule} onChange={onModuleChange} />
      <div className="p-6 flex-1 overflow-y-auto">
        {activeModule === 'Profile' && <ActorProfile actor={actor} actions={profileActions} linkedThreats={linkedThreats} />}
        {activeModule === 'TTPs' && <ActorTTPs actor={actor} onAdd={actions.addTP} onDelete={actions.delTP} newTTP={state.newTTP} setNewTTP={setters.setNewTTP} />}
        {activeModule === 'Campaigns' && <ActorCampaigns campaigns={actor.campaigns} onAdd={actions.addC} newVal={state.newCampaign} setVal={setters.setNewCampaign} />}
        {activeModule === 'Infrastructure' && <ActorInfra infra={actor.infrastructure} onAdd={actions.addI} onDelete={actions.delI} newVal={state.newInfra} setVal={setters.setNewInfra} />}
        {activeModule === 'Exploits' && <ActorExploits exploits={actor.exploits} onAdd={actions.addE} newVal={state.newExploit} setVal={setters.setNewExploit} />}
        {activeModule === 'Industries' && <ActorIndustries targets={actor.targets} onAdd={actions.addT} onDelete={actions.delT} newVal={state.newTarget} setVal={setters.setNewTarget} />}
        {activeModule === 'Threat Feed Links' && <ActorThreatFeeds actorName={actor.name} />}
        {activeModule === 'IoC Associations' && <ActorIoCAssociations threats={linkedThreats} />}
        {activeModule === 'Related Malware Families' && <ActorMalwareFamilies malware={malwareSamples} />}
        {activeModule === 'Infrastructure Details' && <ActorInfraDetails infra={actor.infrastructure} />}
        {activeModule === 'Network Traffic Analysis' && <ActorNetworkAnalysis pcaps={networkCaps} />}
        {activeModule === 'Timeline' && <ActorTimeline history={actor.history} onAdd={actions.addTimeEvent} newEvent={state.newTimelineEvent} setNewEvent={setters.setNewTimelineEvent} />}
        {activeModule === 'Associations' && <ActorAssociations />}
        {activeModule === 'References' && <ActorReferences references={actor.references} onAdd={actions.addRef} onDelete={actions.delRef} newVal={state.newReference} setVal={setters.setNewReference} />}
        {activeModule === 'Reports' && (
            <div className="space-y-6">
               <div className="flex gap-4">
                  <Button onClick={() => actions.handleGenerateReport('Executive')}>+ Actor Profile Summary</Button>
                  <Button onClick={() => actions.handleGenerateReport('Technical')} variant="secondary">+ Technical TTP Analysis</Button>
               </div>
               <div className="space-y-3">
                 {reports.length > 0 ? reports.map(r => (
                   <Card key={r.id} className="p-4 flex justify-between items-center">
                     <div><div className="font-bold text-white">{r.title}</div><div className="text-xs text-slate-500">{r.type} • {r.date}</div></div>
                     <div className="flex gap-2 items-center"><Badge>{r.status}</Badge><Button onClick={() => handleViewReport(r.id)} variant="text" className="text-cyan-400">VIEW</Button></div>
                   </Card>
                 )) : <div className="p-8 text-center text-slate-500 italic">No reports generated for this actor.</div>}
               </div>
            </div>
        )}
      </div>
    </div>
  );
};
export default ActorDetail;
