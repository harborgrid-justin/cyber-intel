
import React from 'react';
import { Campaign } from '../../types';
import { VirtualList } from '../Shared/VirtualList';
import { CardHeader, Badge } from '../Shared/UI';

interface CampaignListProps {
  campaigns: Campaign[];
  selectedId: string | null;
  onSelect: (campaign: Campaign) => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, selectedId, onSelect }) => {
  const renderRow = (c: Campaign) => {
    const isSelected = selectedId === c.id;
    return (
        <div key={c.id} onClick={() => onSelect(c)} className={`p-4 border-b border-slate-800 cursor-pointer transition-colors ${isSelected ? 'bg-slate-800/80 border-l-4 border-l-cyan-500 pl-[calc(1rem-4px)]' : 'hover:bg-slate-800/50 border-l-4 border-l-transparent'}`}>
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
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-full">
      <div className="border-b border-slate-800">
         <CardHeader title="Strategic Campaigns" action={<Badge color="purple">{campaigns.length}</Badge>} />
      </div>
      <div className="flex-1 min-h-0">
         <VirtualList items={campaigns} rowHeight={120} containerHeight={600} renderRow={renderRow} />
      </div>
    </div>
  );
};
export default CampaignList;
