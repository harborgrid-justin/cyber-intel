
import React, { useState, useEffect } from 'react';
import { threatData } from '../../services/dataLayer';
import { ThreatActor } from '../../types';
import ActorList from './ActorList';
import ActorDetail from './ActorDetail';
import { MasterDetailLayout } from '../Shared/Layouts';
import { CONFIG } from '../../config';
import NetworkGraph from '../Shared/NetworkGraph';

interface ActorLibraryProps {
  initialId?: string;
}

const ActorLibrary: React.FC<ActorLibraryProps> = ({ initialId }) => {
  const [libModule, setLibModule] = useState(CONFIG.MODULES.ACTOR_LIBRARY[0]);
  const [activeDetailModule, setActiveDetailModule] = useState('Profile');
  const [actors, setActors] = useState<ThreatActor[]>(threatData.getActors());
  const [selectedActor, setSelectedActor] = useState<ThreatActor | null>(initialId ? actors.find(a => a.id === initialId) || null : null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const activeActor = selectedActor || (!isCreating && !initialId && window.innerWidth >= 768 && actors.length > 0 ? actors[0] : null);
  
  useEffect(() => {
    if (initialId) {
      const found = actors.find(a => a.id === initialId);
      if (found) setSelectedActor(found);
    }
  }, [initialId, actors]);

  useEffect(() => {
    const refresh = () => {
        setActors(threatData.getActors());
        if(activeActor && !threatData.getActors().find(a => a.id === activeActor.id)) setSelectedActor(null);
    };
    window.addEventListener('data-update', refresh);
    return () => window.removeEventListener('data-update', refresh);
  }, [activeActor]);

  const handleRefresh = () => { 
    setActors(threatData.getActors()); 
  };

  const handleCreate = () => {
    if(!newName) return;
    const newActor: ThreatActor = { 
      id: `ACT-${Date.now()}`, name: newName, aliases: [], origin: 'Unknown', description: 'New Profile', 
      sophistication: 'Novice', targets: [], ttps: [], campaigns: [], infrastructure: [], exploits: [], references: [], history: []
    };
    threatData.addActor(newActor); setIsCreating(false); setNewName(''); setSelectedActor(newActor);
  };

  return (
    <MasterDetailLayout
      title="Adversary Library"
      subtitle="Threat Actor Profiles & Attribution"
      modules={CONFIG.MODULES.ACTOR_LIBRARY}
      activeModule={libModule}
      onModuleChange={setLibModule}
      isDetailOpen={!!selectedActor || isCreating}
      onBack={() => { setSelectedActor(null); setIsCreating(false); }}
      listContent={
        libModule === 'Directory' ? (
          <>
            <button onClick={() => { setIsCreating(true); setSelectedActor(null); }} className="mb-4 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded font-bold text-sm uppercase border border-slate-700 w-full">+ New Adversary</button>
            <ActorList actors={actors} selectedId={activeActor?.id || null} onSelect={(a) => { setSelectedActor(a); setIsCreating(false); }} />
          </>
        ) : (
          <div className="p-4 text-slate-500 italic text-sm">Switch to Directory to view list.</div>
        )
      }
      detailContent={
        libModule === 'Global Graph' ? (
           <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
              <h3 className="text-white font-bold mb-4">Global Adversary Interaction Graph</h3>
              <div className="flex-1 bg-slate-950 rounded border border-slate-800 flex items-center justify-center">
                 <NetworkGraph threats={threatData.getThreats().slice(0, 15)} />
              </div>
           </div>
        ) : isCreating ? (
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
             <h2 className="text-xl font-bold text-white mb-4">New Adversary Profile</h2>
             <input className="w-full bg-slate-950 border border-slate-800 p-3 rounded text-white mb-4" placeholder="Actor Name" value={newName} onChange={e => setNewName(e.target.value)} />
             <div className="flex gap-4"><button onClick={handleCreate} className="bg-red-600 text-white px-6 py-2 rounded font-bold">CREATE</button><button onClick={() => setIsCreating(false)} className="text-slate-400 px-6 py-2 font-bold">CANCEL</button></div>
          </div>
        ) : activeActor ? (
          <ActorDetail actor={activeActor} activeModule={activeDetailModule} onModuleChange={setActiveDetailModule} onBack={() => setSelectedActor(null)} modules={CONFIG.MODULES.ACTORS} onUpdate={handleRefresh} />
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900">Select an adversary</div>
        )
      }
    />
  );
};
export default ActorLibrary;
