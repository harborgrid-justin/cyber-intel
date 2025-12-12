import React, { memo } from 'react';

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

const KanbanCard = memo(({ item, onDragStart, children }: { item: any, onDragStart: (e: React.DragEvent) => void, children: React.ReactNode }) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            // Logic for keyboard-based moving could go here (e.g. open a menu to move column)
            e.preventDefault();
        }
    };

    return (
        <div 
            draggable 
            onDragStart={onDragStart}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="cursor-move hover:scale-[1.02] transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg"
            aria-label="Draggable Card"
        >
            {children}
        </div>
    );
});

function KanbanBoardComponent<T>({ columns, items, groupBy, renderCard, onDrop, getItemId, className = '' }: KanbanBoardProps<T>) {
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDrop(id, columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className={`flex-1 overflow-x-auto pb-4 custom-scrollbar ${className}`}>
      <div className="flex gap-4 min-w-[1000px] h-full" role="region" aria-label="Kanban Board">
        {columns.map(col => {
          const colItems = items.filter(item => groupBy(item) === col.id);
          return (
            <div 
              key={col.id} 
              className="flex-1 bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col min-w-[280px]"
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.id)}
              role="list"
              aria-label={`${col.title} Column`}
            >
              <div className="p-3 border-b border-slate-800 bg-slate-950 font-bold text-xs text-slate-400 uppercase tracking-wider flex justify-between items-center sticky top-0 z-10 rounded-t-lg">
                <h2>{col.title}</h2>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">{colItems.length}</span>
              </div>
              <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                {colItems.map(item => (
                  <KanbanCard 
                    key={getItemId(item)} 
                    item={item} 
                    onDragStart={(e) => handleDragStart(e, getItemId(item))}
                  >
                    {renderCard(item)}
                  </KanbanCard>
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

// Cast to generic function type for export to maintain TS generic support
export const KanbanBoard = memo(KanbanBoardComponent) as typeof KanbanBoardComponent;
export default KanbanBoard;