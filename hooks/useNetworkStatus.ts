
import { useState, useEffect } from 'react';

interface NetworkInfo {
  online: boolean;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  saveData: boolean;
  rtt: number;
}

export const useNetworkStatus = (): NetworkInfo => {
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

  const [status, setStatus] = useState<NetworkInfo>(getInfo());

  useEffect(() => {
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
