
import React, { createContext, useContext, useState, useCallback } from 'react';

// The Mediator Interface
type FilterValue = string | number | boolean | null;
type EventPayload = string | number | { id: string; [key: string]: any } | undefined;

interface GridMediatorContextType {
  filters: Record<string, FilterValue>;
  setFilter: (key: string, value: FilterValue) => void;
  notify: (sender: string, event: string, payload?: EventPayload) => void;
  events: { sender: string; event: string; payload?: EventPayload }[];
}

const GridMediatorContext = createContext<GridMediatorContextType | null>(null);

// Concrete Mediator
export const GridMediatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});
  const [events, setEvents] = useState<{ sender: string; event: string; payload?: EventPayload }[]>([]);

  const setFilter = useCallback((key: string, value: FilterValue) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const notify = useCallback((sender: string, event: string, payload?: EventPayload) => {
    // Central logic for handling component interactions
    console.log(`[Mediator] ${sender} triggered ${event}`, payload);
    
    if (event === 'REGION_SELECT' && typeof payload === 'string') {
        setFilter('region', payload);
    }
    
    setEvents(prev => [...prev.slice(-4), { sender, event, payload }]);
  }, [setFilter]);

  return (
    <GridMediatorContext.Provider value={{ filters, setFilter, notify, events }}>
      {children}
    </GridMediatorContext.Provider>
  );
};

export const useGridMediator = () => {
  const context = useContext(GridMediatorContext);
  if (!context) throw new Error("useGridMediator must be used within GridMediatorProvider");
  return context;
};
