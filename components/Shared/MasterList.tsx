
import React from 'react';

interface MasterListProps<T> {
  data: T[];
  title: string;
  selectedId: string | null;
  keyExtractor: (item: T) => string;
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  onSelect: (item: T) => void;
  actionButton?: React.ReactNode;
  className?: string;
}

// Optimization: Memoize individual list items
const ListItem = React.memo(({ 
  item, 
  isSelected, 
  onSelect, 
  renderItem 
}: { 
  item: any, 
  isSelected: boolean, 
  onSelect: (i: any) => void, 
  renderItem: (i: any, s: boolean) => React.ReactNode 
}) => {
  return (
    <div 
      onClick={() => onSelect(item)}
      className={`cursor-pointer transition-all duration-200 border-b border-slate-800 last:border-0 ${
        isSelected 
          ? 'bg-slate-800/80 border-l-4 border-l-cyan-500 pl-[calc(1rem-4px)]' 
          : 'hover:bg-slate-800/40 border-l-4 border-l-transparent pl-4'
      }`}
    >
      {renderItem(item, isSelected)}
    </div>
  );
}, (prev, next) => prev.isSelected === next.isSelected && prev.item === next.item);

export function MasterList<T>({ 
  data, 
  title, 
  selectedId, 
  keyExtractor, 
  renderItem, 
  onSelect,
  actionButton,
  className = '' 
}: MasterListProps<T>) {
  return (
    <div className={`flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden h-full ${className}`}>
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-white tracking-widest uppercase text-sm">{title}</h3>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded font-mono border border-slate-700">{data.length}</span>
        </div>
        {actionButton && <div className="w-full">{actionButton}</div>}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar contain-strict">
        {data.length > 0 ? (
          data.map(item => {
            const id = keyExtractor(item);
            const isSelected = selectedId === id;
            return (
              <ListItem 
                key={id}
                item={item}
                isSelected={isSelected}
                onSelect={onSelect}
                renderItem={renderItem}
              />
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs uppercase tracking-widest">No items found</div>
        )}
      </div>
    </div>
  );
}
export default React.memo(MasterList) as typeof MasterList;
