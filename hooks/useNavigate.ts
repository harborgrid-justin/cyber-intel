
import { useCallback } from 'react';
import { View } from '../types';
import { bus, EVENTS, NavigationPayload } from '../services/eventBus';

export const useNavigate = () => {
  const navigate = useCallback((view: View, params?: Omit<NavigationPayload, 'view'>) => {
    bus.emit(EVENTS.NAVIGATE, { view, ...params });
  }, []);

  return navigate;
};
