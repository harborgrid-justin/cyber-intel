
import React from 'react';
import { Case } from '../../types';
import { VirtualList } from '../Shared/VirtualList';
import { Badge, CardHeader } from '../Shared/UI';

interface CaseListProps {
  cases: Case[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const CaseList: React.FC<CaseListProps> = ({ cases, selectedId, onSelect }) => {
  const renderRow = (c: Case) => {
      const isSelected = selectedId === c.id;
      return (
        <div 
            key={c.id} 
            onClick={() => onSelect(c.id)}
            className={`p-4 border-b border-[var(--colors-borderDefault)] cursor-pointer transition-all duration-200 ${
                isSelected 
                ? 'bg-[var(--colors-surfaceHighlight)] border-l-4 border-l-[var(--colors-primary)] pl-[calc(1rem-4px)]' 
                : 'hover:bg-[var(--colors-surfaceHighlight)]/50 border-l-4 border-l-transparent'
            }`}
        >
          {c.slaBreach && (
            <div className="absolute right-0 top-0 bg-[var(--colors-error)] text-white text-[var(--fontSizes-xs)] font-bold px-1.5 py-0.5 rounded-bl shadow-sm z-10 animate-pulse">SLA BREACH</div>
          )}
          <div className="flex justify-between items-start mb-1">
            <span className={`text-[var(--fontSizes-sm)] font-mono ${isSelected ? 'text-[var(--colors-primary)]' : 'text-[var(--colors-primary)]/50'}`}>{c.id}</span>
            <span className={`text-[var(--fontSizes-xs)] px-2 py-0.5 rounded font-bold uppercase ${
              c.priority === 'CRITICAL' ? 'bg-[var(--colors-criticalDim)] text-[var(--colors-critical)]' : 'bg-[var(--colors-highDim)] text-[var(--colors-high)]'
            }`}>{c.priority}</span>
          </div>
          <h4 className={`font-bold text-[var(--fontSizes-base)] mb-1 ${isSelected ? 'text-white' : 'text-[var(--colors-textPrimary)]'}`}>{c.title}</h4>
          <div className="flex justify-between text-[var(--fontSizes-xs)] text-[var(--colors-textTertiary)] uppercase tracking-wider mt-2">
            <span>{c.assignee}</span>
            <span className={c.status === 'OPEN' ? 'text-[var(--colors-success)]' : ''}>{c.status.replace('_', ' ')}</span>
          </div>
        </div>
      );
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded-xl overflow-hidden h-full">
      <div className="border-b border-[var(--colors-borderDefault)]">
         <CardHeader title="Active Cases" action={<Badge color="blue">{cases.length}</Badge>} />
      </div>
      <div className="flex-1 min-h-0">
          <VirtualList items={cases} rowHeight={100} containerHeight={600} renderRow={renderRow} />
      </div>
    </div>
  );
};
export default CaseList;
