
import React from 'react';
import { Button } from './UI';
import { Icons } from './Icons';

interface Props {
  onExport: (format: 'CSV' | 'JSON' | 'PDF') => void;
}

export const ExportMenu: React.FC<Props> = ({ onExport }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
        <Button onClick={() => setOpen(!open)} variant="secondary" className="flex items-center gap-2">
            <Icons.Box className="w-4 h-4" /> Export
        </Button>
        {open && (
            <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded shadow-xl z-50 flex flex-col py-1">
                    {['CSV', 'JSON', 'PDF'].map(fmt => (
                        <button 
                            key={fmt} 
                            onClick={() => { onExport(fmt as any); setOpen(false); }}
                            className="text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                            As {fmt}
                        </button>
                    ))}
                </div>
            </>
        )}
    </div>
  );
};
