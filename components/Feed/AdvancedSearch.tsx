
import React from 'react';
import { Icons } from '../Shared/Icons';

interface Props {
  value: string;
  onChange: (val: string) => void;
  error: string | null;
  placeholder?: string;
}

export const AdvancedSearch: React.FC<Props> = ({ value, onChange, error, placeholder }) => {
  return (
    <div className="relative group">
      <div className="absolute left-3 top-2.5 text-slate-500">
        {error ? <Icons.AlertTriangle className="w-4 h-4 text-red-500" /> : <Icons.Code className="w-4 h-4" />}
      </div>
      <input
        type="text"
        className={`
          w-full bg-slate-950 border rounded-lg py-2 pl-9 pr-20 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-1 transition-all
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500'}
        `}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Query (e.g. severity:CRITICAL AND score > 80)...'}
        autoComplete="off"
      />
      <div className="absolute right-2 top-2 flex items-center gap-1">
        <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-mono">TQL</span>
      </div>
      
      {/* Error / Syntax Hint Popover */}
      {error && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-red-900/90 backdrop-blur text-red-200 text-xs px-3 py-2 rounded shadow-xl border border-red-500/50 animate-in fade-in slide-in-from-top-1 w-full">
            <span className="font-bold">Syntax Error:</span> {error}
        </div>
      )}
      
      {/* Quick Help (Only show when focused or empty) */}
      {!value && !error && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-slate-900 border border-slate-800 p-2 rounded text-[10px] text-slate-400 shadow-xl w-64 hidden group-focus-within:block">
           <strong>Operators:</strong> AND, OR, (, ) <br/>
           <strong>Comparators:</strong> :, =, {'>'}, {'<'} <br/>
           <strong>Fields:</strong> severity, type, confidence...
        </div>
      )}
    </div>
  );
};
