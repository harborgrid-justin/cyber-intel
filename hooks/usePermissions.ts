
import { useState, useEffect } from 'react';
import { threatData } from '../services/dataLayer';

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const update = () => {
      setPermissions(threatData.currentUser?.effectivePermissions || []);
    };
    update();
    window.addEventListener('user-update', update);
    return () => window.removeEventListener('user-update', update);
  }, []);

  const hasPermission = (resource: string, action: string) => {
    if (permissions.includes('*:*')) return true;
    return permissions.includes(`${resource}:${action}`);
  };

  return { permissions, hasPermission };
};
