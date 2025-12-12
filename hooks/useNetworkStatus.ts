
import { useState, useEffect } from 'react';

interface NetworkInfo {
  online: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  saveData: boolean;
  rtt: number;
}

export const useNetworkStatus = (): NetworkInfo => {
  // Principle 35: Deterministic First Render
  // Default to a safe "online" state to match server-rendered markup (if applicable)
  // or simply provide a stable initial state.
  const [status, setStatus] = useState<NetworkInfo>({
    online: true,
    effectiveType: '4g',
    saveData: false,
    rtt: 0
  });

  useEffect(() => {
    const getInfo = (): NetworkInfo => {
      const nav: any = navigator;
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
      return {
        online: nav.onLine,
        effectiveType: conn ? conn.effectiveType : '4g',
        saveData: conn ? conn.saveData : false,
        rtt: conn ? conn.rtt : 0
      };
    };

    // Hydrate actual status after mount
    setStatus(getInfo());

    const update = () => setStatus(getInfo());
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    
    const nav: any = navigator;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn) {
        conn.addEventListener('change', update);
    }

    return () => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
        if (conn) conn.removeEventListener('change', update);
    };
  }, []);

  return status;
};
