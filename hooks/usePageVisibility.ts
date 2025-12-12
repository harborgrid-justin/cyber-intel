
import { useState, useEffect } from 'react';

export const usePageVisibility = () => {
  // Deterministic initial state
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hydrate state
    if (typeof document !== 'undefined') {
        setIsVisible(!document.hidden);
    }

    const handleChange = () => {
      setIsVisible(!document.hidden);
      if (document.hidden) {
          console.debug('[Visibility] App backgrounded - pausing streams');
      } else {
          console.debug('[Visibility] App foregrounded - resuming');
      }
    };

    document.addEventListener('visibilitychange', handleChange);
    return () => document.removeEventListener('visibilitychange', handleChange);
  }, []);

  return isVisible;
};
