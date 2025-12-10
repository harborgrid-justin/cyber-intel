
import React from 'react';
import { Card, CardHeader } from '../Shared/UI';
import { TTPDef } from '../../types';

interface TtpLibraryProps {
    library: TTPDef[];
    onDragStart: (e: React.DragEvent, type: string, data: string) => void;
}

export const TtpLibrary: React.FC<TtpLibraryProps> = ({ library, onDragStart }) => (
    <Card className="w-64 flex flex-col p-0 overflow-hidden bg-slate-950">
        <CardHeader title="TTP Library" />
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {library.map(t => (
            <div key={t.id} draggable onDragStart={e => onDragStart(e, 'NEW_TTP', t.name)} 
                    className="p-3 bg-slate-900 border border-slate-800 rounded cursor-move hover:border-cyan-500 group">
                <div className="font-bold text-xs text-white">{t.name}</div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                <span>{t.mitreId}</span><span className="text-green-500">${t.cost}</span>
                </div>
                {t.requires && <div className="text-[9px] text-red-400 mt-1">Requires: {t.requires.join(', ')}</div>}
            </div>
            ))}
        </div>
    </Card>
);
