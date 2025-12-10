
import React, { useState, useEffect } from 'react';
import { threatData } from '../../services/dataLayer';

interface Props {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * RBAC UI Gate
 * Checks if current user has required permission string (e.g. 'case:write')
 * Dynamically updates based on threatData.currentUser state
 */
export const PermissionGate: React.FC<Props> = ({ resource, action, children, fallback = null }) => {
  const [permissions, setPermissions] = useState<string[]>(threatData.currentUser?.effectivePermissions || []);

  useEffect(() => {
    const updatePermissions = () => {
        setPermissions(threatData.currentUser?.effectivePermissions || []);
    };
    
    // Listen for both user updates and general data updates to catch login/init
    window.addEventListener('user-update', updatePermissions);
    window.addEventListener('data-update', updatePermissions);
    
    // Initial check in case data loaded before mount
    updatePermissions();

    return () => {
        window.removeEventListener('user-update', updatePermissions);
        window.removeEventListener('data-update', updatePermissions);
    };
  }, []);

  const requiredPerm = `${resource}:${action}`;
  
  // Admin wildcard check or specific permission check
  const hasAccess = permissions.includes('*:*') || permissions.includes(requiredPerm);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
