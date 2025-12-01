
import React, { useState } from 'react';
import { ThreatActor, IncidentReport } from '../../types';
import SubModuleNav from '../Shared/SubModuleNav';
import { threatData } from '../../services/dataLayer';
import { DetailViewHeader } from '../Shared/Layouts';
import { Button, Card, Badge } from '../Shared/UI';
import { ActorProfile, ActorTTPs, ActorCampaigns, ActorInfra, ActorExploits, ActorIndustries, ActorTimeline, ActorAssociations, ActorReferences } from './ActorViews';
import { ActorThreatFeeds, ActorIoCAssociations, ActorMalwareFamilies, ActorInfraDetails, ActorNetworkAnalysis } from './ActorIntelViews';

interface ActorDetailProps {
  actor: ThreatActor; activeModule: string; onModuleChange: (m: string) => void;
  onBack: () => void; modules: string[]; onUpdate: () => void;
}

const ActorDetail: React.FC<ActorDetailProps> = ({ actor, activeModule, onModuleChange, onBack, modules, onUpdate }) => {
  const [newCampaign, setNewCampaign] = useState('');
  const [newInfra, setNewInfra] = useState('');
  const [newExploit, setNewExploit] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [newReference, setNewReference] = useState('');
  const [newTTP, setNewTTP] = useState({ code: '', name: '' });
  const [newTimelineEvent, setNewTimelineEvent] = useState({ date: '', title: '', description: '' });
  const [newThreatId, setNewThreatId] = useState('');
  
  const reports = threatData.getReportsByActor(actor.id);

  const handleDelete = () => { threatData.deleteActor(actor.id); onUpdate(); };
  const addC = () => { if(newCampaign) { threatData.addCampaign(actor.id, newCampaign); setNewCampaign(''); onUpdate(); } };
  const addI = () => { if(newInfra) { threatData.addInfra(actor.id, { id: Date.now().toString(), value: newInfra, type: 'Unknown', status: 'ACTIVE'}); setNewInfra(''); onUpdate(); } };
  const delI = (id: string) => { threatData.updateActor({...actor, infrastructure: actor.infrastructure.filter(i => i.id !== id)}); onUpdate(); };
  const addE = () => { if(newExploit) { threatData.addExploit(actor.id, newExploit); setNewExploit(''); onUpdate(); } };
  const addT = () => { if(newTarget) { threatData.addTarget(actor.id, newTarget); setNewTarget(''); onUpdate(); } };
  const delT = (t: string) => { threatData.updateActor({...actor, targets: actor.targets.filter(target => target !== t)}); onUpdate(); };
  const addTP = () => { if(newTTP.code) { threatData.addTTP(actor.id, { id: Date.now().toString(), ...newTTP }); setNewTTP({ code: '', name: '' }); onUpdate(); } };
  const delTP = (id: string) => { threatData.updateActor({ ...actor, ttps: actor.ttps.filter((t: any) => t.id !== id) }); onUpdate(); };
  const updateOrigin = (val: string) => { threatData.updateActor({...actor, origin: val}); onUpdate(); };
  const addAlias = () => { if(newAlias && !actor.aliases.includes(newAlias)) { threatData.updateActor({...actor, aliases: [...actor.aliases, newAlias]}); setNewAlias(''); onUpdate(); } };
  const addRef = () => { if(newReference) { threatData.addReference(actor.id, newReference); setNewReference(''); onUpdate(); } };
  const delRef = (ref: string) => { threatData.deleteReference(actor.id, ref); onUpdate(); };
  const addTimeEvent = () => { if(newTimelineEvent.date && newTimelineEvent.title) { threatData.addHistoryEvent(actor.id, newTimelineEvent); setNewTimelineEvent({ date: '', title: '', description: '' }); onUpdate(); } };
  const linkThreat = () => { if(newThreatId) { threatData.linkThreatToActor(newThreatId, actor.name); setNewThreatId(''); onUpdate(); } };
  
  const handleGenerateReport = (type: IncidentReport['type']) => {
    const rpt: IncidentReport = {
      id: `RPT-${Date.now()}`,
      title: `${type} Report: ${actor.name}`,
      type,
      date: new Date().toLocaleDateString(),
      author: 'Analyst.Me',
      status: 'DRAFT',
      content: `Adversary profile report for ${actor.name}. Origin: ${actor.origin}. Targets: ${actor.targets.join(', ')}.`,
      relatedActorId: actor.id
    };
    threatData.addReport(rpt);
    onUpdate();
  };

  const linkedThreats = threatData.getThreatsByActor(actor.name);
  const malwareSamples = threatData.getMalwareSamples().filter(m => m.associatedActor === actor.name);
  const networkCaps = threatData.getNetworkCaptures().filter(p => p.associatedActor === actor.name);

  const profileActions = { addC, newC: newCampaign, setC: setNewCampaign, addE, newE: newExploit, setE: setNewExploit, addT, delT, newT: newTarget, setT: setNewTarget, addI, delI, newI: newInfra, setI: setNewInfra, updateOrigin, addAlias, newAlias, setAlias: setNewAlias, addRef, delRef, newRef: newReference, setRef: setNewReference, linkThreat, newThreatId, setThreatId: setNewThreatId };

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
      <DetailViewHeader title={actor.name} onBack={onBack} actions={<Button onClick={handleDelete} variant="danger" className="text-[10px] py-1">DELETE ACTOR</Button>} />
      <SubModuleNav modules={modules} activeModule={activeModule} onChange={onModuleChange} />
      <div className="p-6 flex-1 overflow-y-auto">
        {activeModule === 'Profile' && <ActorProfile actor={actor} actions={profileActions} linkedThreats={linkedThreats} />}
        {activeModule === 'TTPs' && <ActorTTPs actor={actor} onAdd={addTP} onDelete={delTP} newTTP={newTTP} setNewTTP={setNewTTP} />}
        {activeModule === 'Campaigns' && <ActorCampaigns campaigns={actor.campaigns} onAdd={addC} newVal={newCampaign} setVal={setNewCampaign} />}
        {activeModule === 'Infrastructure' && <ActorInfra infra={actor.infrastructure} onAdd={addI} onDelete={delI} newVal={newInfra} setVal={setNewInfra} />}
        {activeModule === 'Exploits' && <ActorExploits exploits={actor.exploits} onAdd={addE} newVal={newExploit} setVal={setNewExploit} />}
        {activeModule === 'Industries' && <ActorIndustries targets={actor.targets} onAdd={addT} onDelete={delT} newVal={newTarget} setVal={setNewTarget} />}
        {activeModule === 'Threat Feed Links' && <ActorThreatFeeds actorName={actor.name} />}
        {activeModule === 'IoC Associations' && <ActorIoCAssociations threats={linkedThreats} />}
        {activeModule === 'Related Malware Families' && <ActorMalwareFamilies malware={malwareSamples} />}
        {activeModule === 'Infrastructure Details' && <ActorInfraDetails infra={actor.infrastructure} />}
        {activeModule === 'Network Traffic Analysis' && <ActorNetworkAnalysis pcaps={networkCaps} />}
        {activeModule === 'Timeline' && <ActorTimeline history={actor.history} onAdd={addTimeEvent} newEvent={newTimelineEvent} setNewEvent={setNewTimelineEvent} />}
        {activeModule === 'Associations' && <ActorAssociations />}
        {activeModule === 'References' && <ActorReferences references={actor.references} onAdd={addRef} onDelete={delRef} newVal={newReference} setVal={setNewReference} />}
        {activeModule === 'Reports' && (
            <div className="space-y-6">
               <div className="flex gap-4">
                  <Button onClick={() => handleGenerateReport('Executive')}>+ Actor Profile Summary</Button>
                  <Button onClick={() => handleGenerateReport('Technical')} variant="secondary">+ Technical TTP Analysis</Button>
               </div>
               <div className="space-y-3">
                 {reports.length > 0 ? reports.map(r => (
                   <Card key={r.id} className="p-4 flex justify-between items-center">
                     <div>
                       <div className="font-bold text-white">{r.title}</div>
                       <div className="text-xs text-slate-500">{r.type} • {r.date}</div>
                     </div>
                     <div className="flex gap-2 items-center">
                       <Badge>{r.status}</Badge>
                       <Button variant="text" className="text-cyan-400">VIEW</Button>
                     </div>
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
