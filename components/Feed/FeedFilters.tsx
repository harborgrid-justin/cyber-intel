
import React from 'react';
import { FilterGroup } from '../Shared/UI';

interface Props {
  severity: string;
  setSeverity: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
}

export const FeedFilters: React.FC<Props> = ({ severity, setSeverity, status, setStatus }) => {
  return (
    <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
        <FilterGroup 
            value={severity} 
            onChange={setSeverity}
            options={['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => ({ label: s, value: s }))} 
        />
        <FilterGroup 
            value={status} 
            onChange={setStatus}
            options={['ALL', 'NEW', 'INVESTIGATING', 'CLOSED'].map(s => ({ label: s, value: s }))} 
        />
    </div>
  );
};
