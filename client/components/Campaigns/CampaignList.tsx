
import React from 'react';
import { Campaign } from '../../types';
import MasterList from '../Shared/MasterList';

interface CampaignListProps {
  campaigns: Campaign[];
  selectedId: string | null;
  onSelect: (campaign: Campaign) => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, selectedId, onSelect }) => {
  return (
    <MasterList<Campaign>
      title="Strategic Campaigns"
      data={campaigns}
      selectedId={selectedId}
      keyExtractor={c => c.id}
      onSelect={onSelect}
      renderItem={(c, isSelected) => (
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
             <span className={`text-xs font-bold font-mono ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>{c.id}</span>
             <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${c.status === 'ACTIVE' ? 'bg-red-900 text-red-400' : 'bg-slate-800 text-slate-400'}`}>{c.status}</span>
          </div>
          <h4 className={`font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{c.name}</h4>
          <div className="text-[10px] text-slate-500 truncate mb-2">{c.description}</div>
          <div className="flex gap-1 flex-wrap">
             {c.actors.map(a => <span key={a} className="px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-[9px] text-slate-400">{a}</span>)}
          </div>
        </div>
      )}
    />
  );
};
export default CampaignList;
