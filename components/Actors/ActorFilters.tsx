
import React from 'react';
import { FilterGroup } from '../Shared/UI';

export const ActorFilters: React.FC = () => {
  return (
    <div className="mb-4">
        <FilterGroup 
            value="ALL" 
            onChange={() => {}} 
            options={[{label:'All', value:'ALL'}, {label:'Advanced', value:'ADVANCED'}, {label:'Nation State', value:'NATION'}]} 
        />
    </div>
  );
};
