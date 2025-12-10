import React from 'react';
import { EXECUTIVE_THEME } from '../../../styles/theme';

export const EmptyState: React.FC<{ icon?: React.ReactNode; message: string; action?: React.ReactNode }> = ({ icon, message, action }) => (
  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-lg bg-slate-900/20 text-center h-full">
    <div className="text-slate-700 mb-4 opacity-50 scale-125">{icon || "∅"}</div>
    <div className={EXECUTIVE_THEME.typography.mono_label + " mb-4"}>{message}</div>
    {action}
  </div>
);
