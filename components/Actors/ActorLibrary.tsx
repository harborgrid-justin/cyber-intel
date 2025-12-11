
import React, { useState } from 'react';
import { threatData } from '../../services/dataLayer';
import { View } from '../../types';
import ActorList from './ActorList';
import ActorDetail from './ActorDetail';
import { MasterDetailLayout } from '../Shared/Layouts';
import NetworkGraph from '../Shared/NetworkGraph';
import { Button, Input, Card, CardHeader } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { useActorLibrary } from '../../hooks/modules/useActorLibrary';

interface ActorLibraryProps {
  initialId?: string;
}

const ActorLibrary: React.FC<ActorLibraryProps> = ({ initialId }) => {
  const {
    modules, libModule, setLibModule,
    filteredActors, selectedActor,
    isCreating, onShowCreate, onBack,
    newName, setNewName,
    searchTerm, setSearchTerm,
    handleCreate, onSelect,
  } = useActorLibrary(initialId);
  
  const [activeDetailModule, setActiveDetailModule] = useState('Profile');

  const Actions = () => (
    <div className="flex gap-2 items-center">
       <Button onClick={onShowCreate} variant="primary" className="text-xs">+ New Adversary</Button>
    </div>
  );

  return (
    <MasterDetailLayout
      title="Adversary Library"
      subtitle="Threat Actor Profiles & Attribution"
      modules={modules}
      activeModule={libModule}
      onModuleChange={setLibModule}
      isDetailOpen={!!selectedActor || isCreating}
      onBack={onBack}
      actions={<Actions />}
      listContent={
        libModule === 'Directory' ? (
          <div className="flex flex-col h-full gap-4">
            <div className="relative">
               <Icons.Code className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
               <Input 
                 placeholder="Search adversaries..." 
                 value={searchTerm} 
                 onChange={e => setSearchTerm(e.target.value)} 
                 className="pl-9"
               />
            </div>
            <ActorList actors={filteredActors} selectedId={selectedActor?.id || null} onSelect={onSelect} />
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500 italic text-sm">
             Directory hidden in {libModule} view.
          </div>
        )
      }
      detailContent={
        libModule === 'Global Graph' ? (
           <Card className="flex-1 p-0 overflow-hidden flex flex-col">
              <CardHeader title="Global Adversary Interaction Graph" action={<Button variant="secondary" className="text-[10px]">EXPORT GRAPH</Button>} />
              <div className="flex-1 bg-slate-990 flex items-center justify-center p-4 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-950 to-slate-950"></div>
                 <div className="relative z-10 w-full h-full max-w-3xl max-h-[600px]">
                    <NetworkGraph threats={threatData.getThreats().slice(0, 15)} />
                 </div>
              </div>
           </Card>
        ) : isCreating ? (
          <Card className="p-0 overflow-hidden m-auto max-w-lg w-full">
             <CardHeader title="Create New Profile" />
             <div className="p-6 space-y-4">
                <div>
                   <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Primary Actor Name</div>
                   <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. APT-42" autoFocus />
                </div>
                <div className="flex gap-4 pt-2">
                   <Button onClick={handleCreate} className="flex-1">CREATE PROFILE</Button>
                   <Button onClick={onBack} variant="text" className="flex-1">CANCEL</Button>
                </div>
             </div>
          </Card>
        ) : selectedActor ? (
          <ActorDetail 
            actor={selectedActor} 
            activeModule={activeDetailModule} 
            onModuleChange={setActiveDetailModule} 
            onBack={onBack} 
            modules={threatData.getModulesForView(View.ACTORS)} 
            onUpdate={() => {}} 
          />
        ) : (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center text-slate-500 border border-slate-800 rounded-xl bg-slate-900/50">
             <Icons.Users className="w-16 h-16 opacity-20 mb-4" />
             <span className="uppercase tracking-widest font-bold text-sm">Select an adversary to view dossier</span>
          </div>
        )
      }
    />
  );
};
export default ActorLibrary;
