
import React from 'react';
import { FilterGroup } from '../Shared/UI';

export const CampaignFilters: React.FC = () => {
  return (
    <div className="mb-4">
        <FilterGroup 
            value="ACTIVE" 
            onChange={() => {}} 
            options={[{label:'Active', value:'ACTIVE'}, {label:'Archived', value:'ARCHIVED'}]} 
        />
    </div>
  );
};
