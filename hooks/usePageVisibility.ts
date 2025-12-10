
import { useState, useEffect } from 'react';

export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
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
