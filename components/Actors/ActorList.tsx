
import React from 'react';
import { ThreatActor } from '../../types';
import { VirtualList } from '../Shared/VirtualList';
import { CardHeader, Badge } from '../Shared/UI';

interface ActorListProps {
  actors: ThreatActor[];
  selectedId: string | null;
  onSelect: (actor: ThreatActor) => void;
}

const ActorList: React.FC<ActorListProps> = ({ actors, selectedId, onSelect }) => {
  const renderRow = (actor: ThreatActor) => {
    const isSelected = selectedId === actor.id;
    return (
        <div key={actor.id} onClick={() => onSelect(actor)} className={`p-4 flex items-center gap-3 border-b border-slate-800 cursor-pointer transition-colors ${isSelected ? 'bg-slate-800/80 border-l-4 border-l-cyan-500 pl-[calc(1rem-4px)]' : 'hover:bg-slate-800/50 border-l-4 border-l-transparent'}`}>
           <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold border transition-colors ${isSelected ? 'bg-cyan-900 text-cyan-200 border-cyan-700' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
             {actor.name.substring(0, 2).toUpperCase()}
           </div>
           <div>
             <h4 className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-200'}`}>{actor.name}</h4>
             <p className="text-[10px] text-slate-400">{actor.origin}</p>
           </div>
        </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-full">
      <div className="border-b border-slate-800">
         <CardHeader title="Adversary Database" action={<Badge color="red">{actors.length}</Badge>} />
      </div>
      <div className="flex-1 min-h-0">
         <VirtualList items={actors} rowHeight={64} containerHeight={600} renderRow={renderRow} />
      </div>
    </div>
  );
};
export default ActorList;
