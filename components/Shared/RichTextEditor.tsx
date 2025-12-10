
import React from 'react';
import { TextArea } from './UI';

interface Props {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export const RichTextEditor: React.FC<Props> = ({ value, onChange, className = '' }) => {
  return (
    <div className={`flex flex-col border border-slate-800 rounded bg-slate-950 ${className}`}>
      <div className="flex gap-1 p-2 border-b border-slate-800 bg-slate-900">
        {['B', 'I', 'U', 'Link', 'Code'].map(tool => (
            <button key={tool} className="px-2 py-1 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded">{tool}</button>
        ))}
      </div>
      <TextArea 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="border-0 focus:ring-0 resize-none p-4 min-h-[150px] bg-transparent" 
        placeholder="Enter formatted content..."
      />
    </div>
  );
};
