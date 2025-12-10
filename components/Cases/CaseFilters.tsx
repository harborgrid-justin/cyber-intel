
import React from 'react';
import { Select, Input } from '../Shared/UI';

export const CaseFilters: React.FC = () => {
  return (
    <div className="flex gap-2 mb-4 bg-slate-900/50 p-2 rounded border border-slate-800">
        <Input placeholder="Search cases..." className="flex-1 text-xs" />
        <Select className="w-32 text-xs">
            <option>All Priorities</option>
            <option>Critical</option>
        </Select>
        <Select className="w-32 text-xs">
            <option>My Cases</option>
            <option>All Cases</option>
        </Select>
    </div>
  );
};
