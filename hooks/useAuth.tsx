import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, TokenStorage } from '../services/apiClient';
import { Logger } from '../services/logger';

/**
 * User Interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  roleId: string;
  organizationId: string;
  clearance: string;
  isVip: boolean;
  mfaEnabled: boolean;
  status: string;
  lastLogin?: Date;
}

/**
 * Auth Context State
 */
interface AuthContextState {
  user: User | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
  hasAnyPermission: (permissions: Array<{ resource: string; action: string }>) => boolean;
  hasAllPermissions: (permissions: Array<{ resource: string; action: string }>) => boolean;
}

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to the application
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize auth state from stored tokens
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already authenticated
        if (apiClient.isAuthenticated()) {
          const storedUser = apiClient.getStoredUser();

          if (storedUser) {
            setUser(storedUser);

            // Fetch fresh user data and permissions
            try {
              const currentUserData = await apiClient.getCurrentUser();

              if (currentUserData.user) {
                setUser(currentUserData.user);
                TokenStorage.setUser(currentUserData.user);
              }

              if (currentUserData.permissions) {
                setPermissions(currentUserData.permissions);
              }
            } catch (fetchError) {
              // If token is invalid, it will be handled by the session expired event
              Logger.warn('Failed to fetch current user data', fetchError);
            }
          }
        }
      } catch (err: any) {
        Logger.error('Auth initialization error', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for session expired events
    const handleSessionExpired = () => {
      setUser(null);
      setPermissions([]);
      setError('Session expired. Please log in again.');
      Logger.info('Session expired, user logged out');
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  /**
   * Login handler
   */
  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(username, password);

      const userData = response.user || response.data?.user;
      const userPermissions = response.permissions || response.data?.permissions || [];

      if (userData) {
        setUser(userData);
        setPermissions(userPermissions);
        Logger.info('User logged in', { username });
      } else {
        throw new Error('Invalid login response');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      Logger.error('Login error', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout handler
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await apiClient.logout();
    } catch (err) {
      Logger.error('Logout error', err);
    } finally {
      setUser(null);
      setPermissions([]);
      setError(null);
      setIsLoading(false);
      Logger.info('User logged out');
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const currentUserData = await apiClient.getCurrentUser();

      if (currentUserData.user) {
        setUser(currentUserData.user);
        TokenStorage.setUser(currentUserData.user);
      }

      if (currentUserData.permissions) {
        setPermissions(currentUserData.permissions);
      }

      Logger.info('User data refreshed');
    } catch (err) {
      Logger.error('Failed to refresh user data', err);
      throw err;
    }
  };

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;

    const requiredPermission = `${resource}:${action}`;

    // Check for super admin
    if (permissions.includes('*:*')) return true;

    // Check for exact permission
    if (permissions.includes(requiredPermission)) return true;

    // Check for resource wildcard
    if (permissions.includes(`${resource}:*`)) return true;

    // Check for action wildcard
    if (permissions.includes(`*:${action}`)) return true;

    return false;
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (
    requiredPermissions: Array<{ resource: string; action: string }>
  ): boolean => {
    if (!user) return false;

    return requiredPermissions.some(perm => hasPermission(perm.resource, perm.action));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (
    requiredPermissions: Array<{ resource: string; action: string }>
  ): boolean => {
    if (!user) return false;

    return requiredPermissions.every(perm => hasPermission(perm.resource, perm.action));
  };

  const value: AuthContextState = {
    user,
    permissions,
    isAuthenticated: !!user && apiClient.isAuthenticated(),
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * Access authentication state and methods
 */
export const useAuth = (): AuthContextState => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

/**
 * ProtectedRoute Component
 * Wraps components that require authentication
 */
interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: { resource: string; action: string };
  requiredPermissions?: Array<{ resource: string; action: string }>;
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
  fallback?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  fallback = <div>Access Denied</div>
}) => {
  const { isAuthenticated, isLoading, hasPermission, hasAllPermissions, hasAnyPermission } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access this page</div>;
  }

  // Check single permission
  if (requiredPermission) {
    const hasAccess = hasPermission(requiredPermission.resource, requiredPermission.action);
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  // Check multiple permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

/**
 * WithPermission Component
 * Conditionally renders children based on permissions
 */
interface WithPermissionProps {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const WithPermission: React.FC<WithPermissionProps> = ({
  resource,
  action,
  children,
  fallback = null
}) => {
  const { hasPermission } = useAuth();

  if (hasPermission(resource, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
