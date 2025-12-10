
import React, { useRef, useState } from 'react';
import { ReportSection } from '../../types';
import { Card, TextArea } from '../Shared/UI';

interface Props {
  sections: ReportSection[];
  onReorder: (sections: ReportSection[]) => void;
  onUpdate: (id: string, content: string) => void;
  activeSectionId: string;
  onSelect: (id: string) => void;
}

const ReportSectionList: React.FC<Props> = ({ sections, onReorder, onUpdate, activeSectionId, onSelect }) => {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const moveItem = (from: number, to: number) => {
    const updated = [...sections];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    onReorder(updated);
  };

  const handleTouchStart = (e: React.TouchEvent, idx: number) => {
    // Only drag if touching the handle
    if ((e.target as HTMLElement).closest('.drag-handle')) {
        setDraggedIdx(idx);
        document.body.style.overflow = 'hidden'; // Prevent scrolling while dragging
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIdx === null || !containerRef.current) return;
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const card = target?.closest('[data-index]') as HTMLElement;
    
    if (card) {
      const targetIdx = parseInt(card.dataset.index || '-1');
      if (targetIdx !== -1 && targetIdx !== draggedIdx) {
        moveItem(draggedIdx, targetIdx);
        setDraggedIdx(targetIdx);
      }
    }
  };

  const handleTouchEnd = () => {
    setDraggedIdx(null);
    document.body.style.overflow = '';
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    moveItem(draggedIdx, idx);
    setDraggedIdx(idx);
  };

  return (
    <div 
        ref={containerRef} 
        className="space-y-4 pb-12"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
      {sections.map((section, idx) => (
        <div
          key={section.id}
          data-index={idx}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragEnd={() => setDraggedIdx(null)}
          onTouchStart={(e) => handleTouchStart(e, idx)}
          className={`transition-all duration-200 ${draggedIdx === idx ? 'opacity-50 scale-95' : 'opacity-100'}`}
        >
          <Card 
            className={`p-0 overflow-hidden border-2 ${activeSectionId === section.id ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-slate-800'}`}
            onClick={() => onSelect(section.id)}
          >
            <div className="bg-slate-950 p-2 flex justify-between items-center cursor-move drag-handle touch-none border-b border-slate-800">
               <div className="flex items-center gap-2">
                 <span className="text-slate-600">☰</span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section.title}</span>
               </div>
               {activeSectionId === section.id && <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>}
            </div>
            <TextArea 
              value={section.content}
              onChange={(e) => onUpdate(section.id, e.target.value)}
              className="w-full bg-slate-900 border-none p-3 text-sm font-mono text-slate-300 resize-none h-auto min-h-[100px] focus:ring-0"
              onFocus={() => onSelect(section.id)}
            />
          </Card>
        </div>
      ))}
      <div className="text-center text-slate-600 text-xs italic py-4 border-2 border-dashed border-slate-800 rounded">
         End of Report
      </div>
    </div>
  );
};

export default ReportSectionList;
