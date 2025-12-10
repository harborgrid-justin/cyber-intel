import { useState } from 'react';
import { ThreatActor, IncidentReport } from '../types';
import { threatData } from '../services/dataLayer';

export const useActorManagement = (actor: ThreatActor, onUpdate: () => void) => {
  const [newCampaign, setNewCampaign] = useState('');
  const [newInfra, setNewInfra] = useState('');
  const [newExploit, setNewExploit] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [newReference, setNewReference] = useState('');
  const [newTTP, setNewTTP] = useState({ code: '', name: '' });
  const [newTimelineEvent, setNewTimelineEvent] = useState({ date: '', title: '', description: '' });
  const [newThreatId, setNewThreatId] = useState('');

  const actions = {
    handleDelete: () => { 
      if (window.confirm(`Are you sure you want to delete the profile for ${actor.name}?`)) {
        threatData.deleteActor(actor.id); 
        onUpdate();
      }
    },
    addC: () => { if(newCampaign) { threatData.addCampaignToActor(actor.id, newCampaign); setNewCampaign(''); onUpdate(); } },
    addI: () => { if(newInfra) { threatData.addInfra(actor.id, { id: Date.now().toString(), value: newInfra, type: 'Unknown', status: 'ACTIVE'}); setNewInfra(''); onUpdate(); } },
    delI: (id: string) => { threatData.updateActor({...actor, infrastructure: actor.infrastructure.filter(i => i.id !== id)}); onUpdate(); },
    addE: () => { if(newExploit) { threatData.addExploit(actor.id, newExploit); setNewExploit(''); onUpdate(); } },
    addT: () => { if(newTarget) { threatData.addTarget(actor.id, newTarget); setNewTarget(''); onUpdate(); } },
    delT: (t: string) => { threatData.updateActor({...actor, targets: actor.targets.filter(target => target !== t)}); onUpdate(); },
    addTP: () => { if(newTTP.code) { threatData.addTTP(actor.id, { id: Date.now().toString(), ...newTTP }); setNewTTP({ code: '', name: '' }); onUpdate(); } },
    delTP: (id: string) => { threatData.updateActor({ ...actor, ttps: actor.ttps.filter((t: any) => t.id !== id) }); onUpdate(); },
    updateOrigin: (val: string) => { threatData.updateActor({...actor, origin: val}); onUpdate(); },
    addAlias: () => { if(newAlias && !actor.aliases.includes(newAlias)) { threatData.updateActor({...actor, aliases: [...actor.aliases, newAlias]}); setNewAlias(''); onUpdate(); } },
    addRef: () => { if(newReference) { threatData.addReference(actor.id, newReference); setNewReference(''); onUpdate(); } },
    delRef: (ref: string) => { threatData.deleteReference(actor.id, ref); onUpdate(); },
    addTimeEvent: () => { if(newTimelineEvent.date && newTimelineEvent.title) { threatData.addHistoryEvent(actor.id, newTimelineEvent); setNewTimelineEvent({ date: '', title: '', description: '' }); onUpdate(); } },
    linkThreat: () => { if(newThreatId) { threatData.linkThreatToActor(newThreatId, actor.name); setNewThreatId(''); onUpdate(); } },
    handleGenerateReport: (type: IncidentReport['type']) => {
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
    }
  };

  return {
    state: { newCampaign, newInfra, newExploit, newTarget, newAlias, newReference, newTTP, newTimelineEvent, newThreatId },
    setters: { setNewCampaign, setNewInfra, setNewExploit, setNewTarget, setNewAlias, setNewReference, setNewTTP, setNewTimelineEvent, setNewThreatId },
    actions
  };
};
