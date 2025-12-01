
import React from 'react';
import { Case } from '../../types';
import MasterList from '../Shared/MasterList';

interface CaseListProps {
  cases: Case[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const CaseList: React.FC<CaseListProps> = ({ cases, selectedId, onSelect }) => {
  return (
    <MasterList<Case>
      title="Active Cases"
      data={cases}
      selectedId={selectedId}
      keyExtractor={c => c.id}
      onSelect={c => onSelect(c.id)}
      renderItem={(c, isSelected) => (
        <div className="p-4 relative">
          {c.slaBreach && (
            <div className="absolute right-0 top-0 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl shadow-sm z-10 animate-pulse">SLA BREACH</div>
          )}
          <div className="flex justify-between items-start mb-1">
            <span className={`text-xs font-mono ${isSelected ? 'text-cyan-400' : 'text-cyan-600'}`}>{c.id}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
              c.priority === 'CRITICAL' ? 'bg-red-900 text-red-400' : 'bg-yellow-900 text-yellow-400'
            }`}>{c.priority}</span>
          </div>
          <h4 className={`font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{c.title}</h4>
          <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wider mt-2">
            <span>{c.assignee}</span>
            <span className={c.status === 'OPEN' ? 'text-green-500' : ''}>{c.status.replace('_', ' ')}</span>
          </div>
        </div>
      )}
    />
  );
};
export default CaseList;
