
import React from 'react';
import { Button } from '../Shared/UI';

interface Props {
  selectedCount: number;
  onArchive: () => void;
  onExport: () => void;
}

export const BulkActions: React.FC<Props> = ({ selectedCount, onArchive, onExport }) => {
  if (selectedCount === 0) return null;
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4">
        <span className="text-xs font-bold text-white px-2">{selectedCount} Selected</span>
        <div className="h-4 w-px bg-slate-700"></div>
        <Button onClick={onArchive} variant="secondary" className="text-xs py-1">ARCHIVE</Button>
        <Button onClick={onExport} variant="secondary" className="text-xs py-1">EXPORT</Button>
    </div>
  );
};
