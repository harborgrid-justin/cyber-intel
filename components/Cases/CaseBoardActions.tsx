
import React from 'react';
import { Button, FilterGroup } from '../Shared/UI';

interface ActionsProps {
  onReprioritize: () => void;
  onCreate: () => void;
  viewMode: 'LIST' | 'KANBAN';
  setViewMode: (mode: 'LIST' | 'KANBAN') => void;
}

export const CaseBoardActions: React.FC<ActionsProps> = ({ onReprioritize, onCreate, viewMode, setViewMode }) => (
    <div className="flex gap-4 shrink-0 items-center">
       <Button onClick={onCreate} variant="primary" className="text-sm">+ Ticket</Button>
       <Button onClick={onReprioritize} variant="secondary" className="text-amber-500">⚡ AI Priority</Button>
       <FilterGroup 
         value={viewMode}
         onChange={(v) => setViewMode(v as any)}
         options={[
           { label: 'List View', value: 'LIST' },
           { label: 'Board View', value: 'KANBAN' }
         ]}
         className="ml-2"
       />
    </div>
);
