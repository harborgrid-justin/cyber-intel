
import React, { useState, useMemo } from 'react';
import { ThreatActor, View } from '../../types';
import SubModuleNav from '../Shared/SubModuleNav';
import { threatData } from '../../services/dataLayer';
import { DetailViewHeader } from '../Shared/Layouts';
import { Button, Card, Badge } from '../Shared/UI';
import { useActorManagement } from '../../hooks';
import { ActorDossierView } from './Views/ActorDossier';
import { ActorOperationsView } from './Views/ActorOperations';
import { TechnicalOpsView } from './Views/ActorEditComponents';
import { IntelligenceView } from './ActorIntelViews';

interface ActorDetailProps {
  actor: ThreatActor; 
  activeModule: string; // Kept for interface compatibility, but we'll use internal state for the consolidated view
  onModuleChange: (m: string) => void;
  onBack: () => void; 
  modules: string[]; 
  onUpdate: () => void;
}

const ActorDetail: React.FC<ActorDetailProps> = ({ actor, onBack, onUpdate }) => {
  const modules = useMemo(() => threatData.getModulesForView(View.ACTORS), []);
  const [activeTab, setActiveTab] = useState(modules[0]);
  const { state, setters, actions } = useActorManagement(actor, onUpdate);
  
  const reports = threatData.getReportsByActor(actor.id);
  const linkedThreats = threatData.getThreatsByActor(actor.name);
  const malwareSamples = threatData.getMalwareSamples().filter(m => m.associatedActor === actor.name);
  const networkCaps = threatData.getNetworkCaptures().filter(p => p.associatedActor === actor.name);

  // Map hook setters to simpler prop names for sub-components
  const profileActions = { 
    ...actions, 
    newAlias: state.newAlias, setAlias: setters.setNewAlias, 
    newThreatId: state.newThreatId, setThreatId: setters.setNewThreatId 
  };

  const handleViewReport = (id: string) => {
    window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.REPORTS, id } }));
  };

  return (
    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
      <DetailViewHeader 
        title={actor.name} 
        subtitle={`ID: ${actor.id} • Last Active: ${new Date().toLocaleDateString()}`}
        onBack={onBack} 
        actions={<Button onClick={actions.handleDelete} variant="danger" className="text-[10px] py-1 border-red-900/50 hover:bg-red-900/20">DELETE ACTOR</Button>} 
      />
      
      <SubModuleNav 
        modules={modules} 
        activeModule={activeTab} 
        onChange={setActiveTab} 
      />
      
      <div className="p-4 md:p-6 flex-1 overflow-y-auto bg-slate-900/30 scroll-smooth">
        <div className="max-w-7xl mx-auto h-full">
          {activeTab === 'Dossier' && (
            <ActorDossierView 
              actor={actor} 
              actions={profileActions} 
              state={state} 
              setters={setters} 
            />
          )}

          {activeTab === 'Technical Ops' && (
            <TechnicalOpsView 
              actor={actor} 
              actions={actions}
              state={state}
              setters={setters}
            />
          )}

          {activeTab === 'Operations' && (
            <ActorOperationsView 
              actor={actor}
              actions={actions}
              state={state}
              setters={setters}
            />
          )}

          {activeTab === 'Intelligence' && (
            <IntelligenceView 
              actor={actor}
              linkedThreats={linkedThreats}
              malware={malwareSamples}
              pcaps={networkCaps}
              actions={actions}
              state={state}
              setters={setters}
            />
          )}

          {activeTab === 'Reports' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex justify-between items-center bg-slate-900 p-4 rounded border border-slate-800">
                    <div>
                      <h3 className="text-white font-bold">Intelligence Products</h3>
                      <p className="text-xs text-slate-500">Generated reports and briefings linked to this adversary.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => actions.handleGenerateReport('Executive')} variant="primary">+ Executive Brief</Button>
                        <Button onClick={() => actions.handleGenerateReport('Technical')} variant="secondary">+ Technical Analysis</Button>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {reports.length > 0 ? reports.map(r => (
                     <Card key={r.id} className="p-4 flex flex-col justify-between hover:border-cyan-500 transition-colors group cursor-pointer" onClick={() => handleViewReport(r.id)}>
                       <div>
                         <div className="flex justify-between items-start mb-2">
                            <Badge color={r.type === 'Executive' ? 'purple' : 'blue'}>{r.type}</Badge>
                            <span className="text-[10px] text-slate-500">{r.date}</span>
                         </div>
                         <div className="font-bold text-white text-sm mb-1 group-hover:text-cyan-400">{r.title}</div>
                         <div className="text-xs text-slate-500 font-mono">{r.id}</div>
                       </div>
                       <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                          <span className={`text-[10px] font-bold ${r.status === 'READY' ? 'text-green-500' : 'text-yellow-500'}`}>{r.status}</span>
                          <span className="text-xs text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">READ REPORT →</span>
                       </div>
                     </Card>
                   )) : (
                     <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-800 rounded-xl">
                        <div className="text-slate-500 italic">No reports generated for this actor yet.</div>
                     </div>
                   )}
                 </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ActorDetail;
