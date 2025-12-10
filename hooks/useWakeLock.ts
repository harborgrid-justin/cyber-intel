
import { useState, useEffect } from 'react';

export const useWakeLock = () => {
  const [active, setActive] = useState(false);
  const [sentinel, setSentinel] = useState<WakeLockSentinel | null>(null);

  const requestLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        const s = await navigator.wakeLock.request('screen');
        setSentinel(s);
        setActive(true);
        s.addEventListener('release', () => {
            setActive(false);
            setSentinel(null);
        });
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    }
  };

  const releaseLock = async () => {
    if (sentinel) await sentinel.release();
  };

  useEffect(() => {
      return () => { releaseLock(); };
  }, []);

  return { active, requestLock, releaseLock };
};
