
import React from 'react';

export interface KanbanColumn {
  id: string;
  title: string;
  count?: number;
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn[];
  items: T[];
  groupBy: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  onDrop: (itemId: string, newColumnId: string) => void;
  getItemId: (item: T) => string;
  className?: string;
}

export function KanbanBoard<T>({ columns, items, groupBy, renderCard, onDrop, getItemId, className = '' }: KanbanBoardProps<T>) {
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDrop(id, columnId);
  };

  return (
    <div className={`flex-1 overflow-x-auto pb-4 custom-scrollbar ${className}`}>
      <div className="flex gap-4 min-w-[1000px] h-full">
        {columns.map(col => {
          const colItems = items.filter(item => groupBy(item) === col.id);
          return (
            <div 
              key={col.id} 
              className="flex-1 bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col min-w-[280px]"
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(e, col.id)}
            >
              <div className="p-3 border-b border-slate-800 bg-slate-950 font-bold text-xs text-slate-400 uppercase tracking-wider flex justify-between items-center sticky top-0 z-10 rounded-t-lg">
                <span>{col.title}</span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">{colItems.length}</span>
              </div>
              <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                {colItems.map(item => (
                  <div 
                    key={getItemId(item)} 
                    draggable 
                    onDragStart={e => handleDragStart(e, getItemId(item))}
                    className="cursor-move hover:scale-[1.02] transition-transform duration-200"
                  >
                    {renderCard(item)}
                  </div>
                ))}
                {colItems.length === 0 && (
                  <div className="h-20 border-2 border-dashed border-slate-800 rounded flex items-center justify-center text-slate-600 text-[10px] uppercase">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default KanbanBoard;
