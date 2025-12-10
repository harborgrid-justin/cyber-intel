import React from 'react';

export const DataList: React.FC<{ items: any[]; renderItem: (item: any, index: number) => React.ReactNode; emptyMessage?: string; className?: string }> = ({ items, renderItem, emptyMessage = 'No Data', className = '' }) => (
    <div className={`flex flex-col ${className}`}>
        {items.length > 0 ? items.map((item, i) => (
            <div key={i} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-900/30 transition-colors">
                {renderItem(item, i)}
            </div>
        )) : (
            <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-lg text-slate-600 text-xs uppercase tracking-widest">
                {emptyMessage}
            </div>
        )}
    </div>
);
