import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../hooks/useAuth';
import { userFixtures } from '../../fixtures/users.fixtures';
import React from 'react';

// Mock apiClient
const mockApiClient = {
  isAuthenticated: vi.fn(),
  getStoredUser: vi.fn(),
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock('../../../services/apiClient', () => ({
  apiClient: mockApiClient,
  TokenStorage: {
    setUser: vi.fn(),
    getUser: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock('../../../services/logger', () => ({
  Logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useAuth Hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockApiClient.isAuthenticated.mockReturnValue(false);
    mockApiClient.getStoredUser.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with unauthenticated state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.permissions).toEqual([]);
    });

    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      spy.mockRestore();
    });

    it('should restore authenticated state from storage', async () => {
      const user = userFixtures[0];
      mockApiClient.isAuthenticated.mockReturnValue(true);
      mockApiClient.getStoredUser.mockReturnValue(user);
      mockApiClient.getCurrentUser.mockResolvedValue({
        user,
        permissions: ['threats:read', 'cases:read'],
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(user);
      expect(result.current.permissions).toEqual(['threats:read', 'cases:read']);
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = userFixtures[0];
      const credentials = { username: 'admin', password: 'password123' };
      const loginResponse = {
        user,
        permissions: ['*:*'],
      };

      mockApiClient.login.mockResolvedValue(loginResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login(credentials.username, credentials.password);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(user);
      expect(result.current.permissions).toEqual(['*:*']);
      expect(mockApiClient.login).toHaveBeenCalledWith('admin', 'password123');
    });

    it('should handle login failure with invalid credentials', async () => {
      const error = new Error('Invalid credentials');
      mockApiClient.login.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.login('invalid', 'wrong');
        });
      }).rejects.toThrow('Invalid credentials');

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('should handle login with nested response structure', async () => {
      const user = userFixtures[0];
      const loginResponse = {
        data: {
          user,
          permissions: ['threats:read'],
        },
      };

      mockApiClient.login.mockResolvedValue(loginResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      expect(result.current.user).toEqual(user);
      expect(result.current.permissions).toEqual(['threats:read']);
    });

    it('should handle invalid login response without user data', async () => {
      mockApiClient.login.mockResolvedValue({});

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.login('test', 'test');
        });
      }).rejects.toThrow('Invalid login response');
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const user = userFixtures[0];
      mockApiClient.login.mockResolvedValue({
        user,
        permissions: ['threats:read'],
      });
      mockApiClient.logout.mockResolvedValue({});

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Login first
      await act(async () => {
        await result.current.login('admin', 'password');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.permissions).toEqual([]);
      expect(mockApiClient.logout).toHaveBeenCalled();
    });

    it('should logout even if API call fails', async () => {
      const user = userFixtures[0];
      mockApiClient.login.mockResolvedValue({ user, permissions: [] });
      mockApiClient.logout.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Refresh User', () => {
    it('should refresh user data successfully', async () => {
      const initialUser = userFixtures[0];
      const updatedUser = { ...initialUser, firstName: 'Updated' };

      mockApiClient.login.mockResolvedValue({
        user: initialUser,
        permissions: ['threats:read'],
      });
      mockApiClient.getCurrentUser.mockResolvedValue({
        user: updatedUser,
        permissions: ['threats:read', 'threats:write'],
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      expect(result.current.user?.firstName).toBe('System');

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user?.firstName).toBe('Updated');
      expect(result.current.permissions).toContain('threats:write');
    });

    it('should handle refresh failure', async () => {
      const user = userFixtures[0];
      mockApiClient.login.mockResolvedValue({ user, permissions: [] });
      mockApiClient.getCurrentUser.mockRejectedValue(new Error('Refresh failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      await expect(async () => {
        await act(async () => {
          await result.current.refreshUser();
        });
      }).rejects.toThrow('Refresh failed');
    });
  });

  describe('Permission Checks', () => {
    it('should check exact permission match', async () => {
      const user = userFixtures[0];
      mockApiClient.login.mockResolvedValue({
        user,
        permissions: ['threats:read', 'cases:write'],
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      expect(result.current.hasPermission('threats', 'read')).toBe(true);
      expect(result.current.hasPermission('cases', 'write')).toBe(true);
      expect(result.current.hasPermission('threats', 'delete')).toBe(false);
    });

    it('should grant all permissions with super admin wildcard', async () => {
      const user = userFixtures[0];
      mockApiClient.login.mockResolvedValue({
        user,
        permissions: ['*:*'],
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      expect(result.current.hasPermission('threats', 'read')).toBe(true);
      expect(result.current.hasPermission('cases', 'delete')).toBe(true);
      expect(result.current.hasPermission('any', 'permission')).toBe(true);
    });

    it('should check resource wildcard permissions', async () => {
      const user = userFixtures[0];
      mockApiClient.login.mockResolvedValue({
        user,
        permissions: ['threats:*'],
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      expect(result.current.hasPermission('threats', 'read')).toBe(true);
      expect(result.current.hasPermission('threats', 'write')).toBe(true);
      expect(result.current.hasPermission('threats', 'delete')).toBe(true);
      expect(result.current.hasPermission('cases', 'read')).toBe(false);
    });

    it('should check action wildcard permissions', async () => {
      const user = userFixtures[0];
      mockApiClient.login.mockResolvedValue({
        user,
        permissions: ['*:read'],
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      expect(result.current.hasPermission('threats', 'read')).toBe(true);
      expect(result.current.hasPermission('cases', 'read')).toBe(true);
      expect(result.current.hasPermission('threats', 'write')).toBe(false);
    });

    it('should return false for unauthenticated users', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.hasPermission('threats', 'read')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the required permissions', async () => {
      const user = userFixtures[0];
      mockApiClient.login.mockResolvedValue({
        user,
        permissions: ['threats:read', 'cases:write'],
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      const requiredPermissions = [
        { resource: 'threats', action: 'delete' },
        { resource: 'cases', action: 'write' },
      ];

      expect(result.current.hasAnyPermission(requiredPermissions)).toBe(true);
    });

    it('should return false if user has none of the required permissions', async () => {
      const user = userFixtures[0];
      mockApiClient.login.mockResolvedValue({
        user,
        permissions: ['threats:read'],
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      const requiredPermissions = [
        { resource: 'threats', action: 'delete' },
        { resource: 'cases', action: 'write' },
      ];

      expect(result.current.hasAnyPermission(requiredPermissions)).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all required permissions', async () => {
      const user = userFixtures[0];
      mockApiClient.login.mockResolvedValue({
        user,
        permissions: ['threats:read', 'threats:write', 'cases:write'],
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      const requiredPermissions = [
        { resource: 'threats', action: 'read' },
        { resource: 'cases', action: 'write' },
      ];

      expect(result.current.hasAllPermissions(requiredPermissions)).toBe(true);
    });

    it('should return false if user is missing any required permission', async () => {
      const user = userFixtures[0];
      mockApiClient.login.mockResolvedValue({
        user,
        permissions: ['threats:read'],
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      const requiredPermissions = [
        { resource: 'threats', action: 'read' },
        { resource: 'threats', action: 'write' },
      ];

      expect(result.current.hasAllPermissions(requiredPermissions)).toBe(false);
    });
  });

  describe('Session Expiration', () => {
    it('should handle session expiration event', async () => {
      const user = userFixtures[0];
      mockApiClient.login.mockResolvedValue({
        user,
        permissions: ['threats:read'],
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('admin', 'password');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Simulate session expiration
      act(() => {
        window.dispatchEvent(new Event('auth:session-expired'));
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(result.current.error).toBe('Session expired. Please log in again.');
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading during login', async () => {
      const user = userFixtures[0];
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve;
      });

      mockApiClient.login.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.login('admin', 'password');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await act(async () => {
        resolveLogin!({ user, permissions: [] });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear error on successful login after failed attempt', async () => {
      const user = userFixtures[0];
      mockApiClient.login
        .mockRejectedValueOnce(new Error('First login failed'))
        .mockResolvedValueOnce({ user, permissions: [] });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First failed login
      await expect(async () => {
        await act(async () => {
          await result.current.login('admin', 'wrong');
        });
      }).rejects.toThrow();

      expect(result.current.error).toBe('First login failed');

      // Second successful login
      await act(async () => {
        await result.current.login('admin', 'correct');
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
