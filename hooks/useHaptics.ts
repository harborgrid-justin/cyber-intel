
import { useCallback } from 'react';

export const useHaptics = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const triggerAlert = () => vibrate([200, 100, 200]); // SOS-like
  const triggerSuccess = () => vibrate(50);
  
  return { vibrate, triggerAlert, triggerSuccess };
};
