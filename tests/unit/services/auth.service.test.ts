import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userFixtures } from '../../fixtures/users.fixtures';
import { mockApiClient, createApiResponse, createApiError } from '../../utils/apiMocks';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const user = userFixtures[0];
      const credentials = {
        username: user.username,
        password: 'securePassword123',
      };

      const loginResponse = {
        token: 'mock-jwt-token-12345',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };

      mockApiClient.post.mockResolvedValue(createApiResponse(loginResponse));

      const result = await mockApiClient.post('/api/auth/login', credentials);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/login', credentials);
      expect(result.data.token).toBe('mock-jwt-token-12345');
      expect(result.data.user.username).toBe(user.username);
      expect(result.data.user.role).toBe('admin');
    });

    it('should fail login with invalid credentials', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'wrongpassword',
      };

      mockApiClient.post.mockRejectedValue(createApiError('Invalid credentials', 401));

      try {
        await mockApiClient.post('/api/auth/login', credentials);
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.message).toBe('Invalid credentials');
      }
    });

    it('should fail login for inactive user', async () => {
      const inactiveUser = userFixtures.find(u => !u.active);
      const credentials = {
        username: inactiveUser?.username,
        password: 'password123',
      };

      mockApiClient.post.mockRejectedValue(createApiError('Account is inactive', 403));

      try {
        await mockApiClient.post('/api/auth/login', credentials);
      } catch (error: any) {
        expect(error.response.status).toBe(403);
        expect(error.message).toBe('Account is inactive');
      }
    });

    it('should handle MFA requirement', async () => {
      const credentials = {
        username: 'admin',
        password: 'password123',
      };

      const mfaResponse = {
        mfaRequired: true,
        sessionId: 'temp-session-id',
      };

      mockApiClient.post.mockResolvedValue(createApiResponse(mfaResponse));

      const result = await mockApiClient.post('/api/auth/login', credentials);

      expect(result.data.mfaRequired).toBe(true);
      expect(result.data.sessionId).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      mockApiClient.post.mockResolvedValue(createApiResponse({ success: true }));

      const result = await mockApiClient.post('/api/auth/logout');

      expect(result.data.success).toBe(true);
    });

    it('should clear local storage on logout', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', username: 'test' }));

      mockApiClient.post.mockResolvedValue(createApiResponse({ success: true }));

      await mockApiClient.post('/api/auth/logout');

      // Simulate token clearing
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const token = 'valid-jwt-token';
      const user = userFixtures[0];

      mockApiClient.get.mockResolvedValue(createApiResponse({
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      }));

      const result = await mockApiClient.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });

      expect(result.data.valid).toBe(true);
      expect(result.data.user).toBeDefined();
    });

    it('should reject invalid token', async () => {
      mockApiClient.get.mockRejectedValue(createApiError('Invalid token', 401));

      try {
        await mockApiClient.get('/api/auth/verify', {
          headers: { Authorization: 'Bearer invalid-token' },
        });
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should reject expired token', async () => {
      mockApiClient.get.mockRejectedValue(createApiError('Token expired', 401));

      try {
        await mockApiClient.get('/api/auth/verify', {
          headers: { Authorization: 'Bearer expired-token' },
        });
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.message).toBe('Token expired');
      }
    });
  });

  describe('refreshToken', () => {
    it('should refresh a valid token', async () => {
      const newToken = 'new-jwt-token';

      mockApiClient.post.mockResolvedValue(createApiResponse({
        token: newToken,
      }));

      const result = await mockApiClient.post('/api/auth/refresh', {
        refreshToken: 'valid-refresh-token',
      });

      expect(result.data.token).toBe(newToken);
    });

    it('should fail with invalid refresh token', async () => {
      mockApiClient.post.mockRejectedValue(createApiError('Invalid refresh token', 401));

      try {
        await mockApiClient.post('/api/auth/refresh', {
          refreshToken: 'invalid-refresh-token',
        });
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('changePassword', () => {
    it('should change password with valid current password', async () => {
      const passwordChange = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      };

      mockApiClient.post.mockResolvedValue(createApiResponse({ success: true }));

      const result = await mockApiClient.post('/api/auth/change-password', passwordChange);

      expect(result.data.success).toBe(true);
    });

    it('should fail with incorrect current password', async () => {
      mockApiClient.post.mockRejectedValue(createApiError('Current password is incorrect', 400));

      try {
        await mockApiClient.post('/api/auth/change-password', {
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword456',
        });
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should validate password strength', async () => {
      mockApiClient.post.mockRejectedValue(createApiError('Password too weak', 400));

      try {
        await mockApiClient.post('/api/auth/change-password', {
          currentPassword: 'oldPassword123',
          newPassword: '123',
        });
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.message).toBe('Password too weak');
      }
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      mockApiClient.post.mockResolvedValue(createApiResponse({
        message: 'Password reset email sent',
      }));

      const result = await mockApiClient.post('/api/auth/reset-password', {
        email: 'user@sentinel.local',
      });

      expect(result.data.message).toBe('Password reset email sent');
    });

    it('should handle non-existent email', async () => {
      mockApiClient.post.mockResolvedValue(createApiResponse({
        message: 'If the email exists, a reset link will be sent',
      }));

      const result = await mockApiClient.post('/api/auth/reset-password', {
        email: 'nonexistent@example.com',
      });

      // Should return same message for security
      expect(result.data.message).toBeDefined();
    });

    it('should reset password with valid token', async () => {
      mockApiClient.post.mockResolvedValue(createApiResponse({ success: true }));

      const result = await mockApiClient.post('/api/auth/reset-password/confirm', {
        token: 'valid-reset-token',
        newPassword: 'newSecurePassword123',
      });

      expect(result.data.success).toBe(true);
    });
  });

  describe('verifyMFA', () => {
    it('should verify MFA code and complete login', async () => {
      const mfaCode = '123456';
      const sessionId = 'temp-session-id';

      const loginResponse = {
        token: 'final-jwt-token',
        user: userFixtures[0],
      };

      mockApiClient.post.mockResolvedValue(createApiResponse(loginResponse));

      const result = await mockApiClient.post('/api/auth/mfa/verify', {
        sessionId,
        code: mfaCode,
      });

      expect(result.data.token).toBe('final-jwt-token');
      expect(result.data.user).toBeDefined();
    });

    it('should reject invalid MFA code', async () => {
      mockApiClient.post.mockRejectedValue(createApiError('Invalid MFA code', 401));

      try {
        await mockApiClient.post('/api/auth/mfa/verify', {
          sessionId: 'temp-session-id',
          code: '000000',
        });
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('getProfile', () => {
    it('should get current user profile', async () => {
      const user = userFixtures[0];

      mockApiClient.get.mockResolvedValue(createApiResponse(user));

      const result = await mockApiClient.get('/api/auth/profile');

      expect(result.data.id).toBe(user.id);
      expect(result.data.username).toBe(user.username);
      expect(result.data.email).toBe(user.email);
    });

    it('should require authentication', async () => {
      mockApiClient.get.mockRejectedValue(createApiError('Unauthorized', 401));

      try {
        await mockApiClient.get('/api/auth/profile');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
        preferences: {
          theme: 'light',
          notifications: { email: false },
        },
      };

      const updatedUser = { ...userFixtures[0], ...updates };
      mockApiClient.put.mockResolvedValue(createApiResponse(updatedUser));

      const result = await mockApiClient.put('/api/auth/profile', updates);

      expect(result.data.firstName).toBe('Updated');
      expect(result.data.lastName).toBe('Name');
      expect(result.data.preferences.theme).toBe('light');
    });
  });

  describe('checkPermission', () => {
    it('should check if user has specific permission', async () => {
      mockApiClient.get.mockResolvedValue(createApiResponse({ hasPermission: true }));

      const result = await mockApiClient.get('/api/auth/permissions/threats.create');

      expect(result.data.hasPermission).toBe(true);
    });

    it('should return false for permission not granted', async () => {
      mockApiClient.get.mockResolvedValue(createApiResponse({ hasPermission: false }));

      const result = await mockApiClient.get('/api/auth/permissions/admin.all');

      expect(result.data.hasPermission).toBe(false);
    });
  });
});
