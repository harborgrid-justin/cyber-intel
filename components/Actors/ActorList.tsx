
import React from 'react';
import { ThreatActor } from '../../types';
import MasterList from '../Shared/MasterList';

interface ActorListProps {
  actors: ThreatActor[];
  selectedId: string | null;
  onSelect: (actor: ThreatActor) => void;
}

const ActorList: React.FC<ActorListProps> = ({ actors, selectedId, onSelect }) => {
  return (
    <MasterList<ThreatActor>
      title="Adversary Database"
      data={actors}
      selectedId={selectedId}
      onSelect={onSelect}
      keyExtractor={a => a.id}
      renderItem={(actor, isSelected) => (
        <div className={`p-4 flex items-center gap-3`}>
           <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold border transition-colors ${
             isSelected 
               ? 'bg-cyan-900 text-cyan-200 border-cyan-700' 
               : 'bg-slate-700 text-slate-300 border-slate-600'
           }`}>
             {actor.name.substring(0, 2).toUpperCase()}
           </div>
           <div>
             <h4 className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-200'}`}>{actor.name}</h4>
             <p className="text-[10px] text-slate-400">{actor.origin}</p>
           </div>
        </div>
      )}
    />
  );
};
export default ActorList;
