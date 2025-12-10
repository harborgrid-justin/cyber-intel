import React from 'react';
import { EXECUTIVE_THEME } from '../../../styles/theme';

export const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label?: string }> = ({ checked, onChange, label }) => (
  <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onChange(!checked)}>
    <div className={`w-9 h-5 rounded-full relative transition-colors duration-300 border ${checked ? 'bg-cyan-900 border-cyan-500' : 'bg-slate-800 border-slate-700 group-hover:border-slate-600'}`}>
      <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 shadow-sm ${checked ? 'left-[18px] shadow-cyan-500/50' : 'left-1 bg-slate-400'}`} />
    </div>
    {label && <span className={`${EXECUTIVE_THEME.typography.mono_label} group-hover:text-slate-300 transition-colors`}>{label}</span>}
  </div>
);
