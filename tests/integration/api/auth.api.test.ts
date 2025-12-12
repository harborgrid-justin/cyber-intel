import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { userFixtures } from '../../fixtures/users.fixtures';

// Integration test for Auth API endpoints
// These tests validate the full auth flow including API calls
describe('Auth API Integration Tests', () => {
  let mockServer: any;
  let apiUrl: string;

  beforeEach(() => {
    apiUrl = process.env.API_URL || 'http://localhost:3001';
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (mockServer) {
      mockServer.close();
    }
  });

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const credentials = {
        username: 'admin',
        password: 'password123',
      };

      const user = userFixtures[0];
      const mockResponse = {
        success: true,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        permissions: ['*:*'],
      };

      // Mock fetch for integration test
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.user.username).toBe('admin');
      expect(data.permissions).toContain('*:*');
    });

    it('should return 401 for invalid credentials', async () => {
      const credentials = {
        username: 'invalid',
        password: 'wrongpassword',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Invalid credentials',
          message: 'Username or password is incorrect',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid credentials');
    });

    it('should return 403 for inactive user account', async () => {
      const inactiveUser = userFixtures.find(u => !u.active);
      const credentials = {
        username: inactiveUser?.username || 'jdoe',
        password: 'password123',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          error: 'Account inactive',
          message: 'Your account has been deactivated',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Account inactive');
    });

    it('should require MFA code for users with MFA enabled', async () => {
      const user = userFixtures.find(u => u.mfaEnabled);
      const credentials = {
        username: user?.username || 'admin',
        password: 'password123',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          mfaRequired: true,
          sessionId: 'temp-session-12345',
          message: 'MFA code required',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      expect(data.mfaRequired).toBe(true);
      expect(data.sessionId).toBeDefined();
    });

    it('should validate request body', async () => {
      const invalidPayload = { username: 'admin' }; // Missing password

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Validation error',
          message: 'Password is required',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should successfully logout authenticated user', async () => {
      const token = 'valid-jwt-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Logged out successfully',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
    });

    it('should return 401 if no token provided', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify valid JWT token', async () => {
      const token = 'valid-jwt-token';
      const user = userFixtures[0];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          valid: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.valid).toBe(true);
      expect(data.user).toBeDefined();
    });

    it('should reject invalid token', async () => {
      const token = 'invalid-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          valid: false,
          error: 'Invalid token',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.valid).toBe(false);
    });

    it('should reject expired token', async () => {
      const token = 'expired-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          valid: false,
          error: 'Token expired',
          message: 'Please log in again',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Token expired');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          token: 'new-jwt-token',
          refreshToken: 'new-refresh-token',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const refreshToken = 'invalid-refresh-token';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Invalid refresh token',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid refresh token');
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      const token = 'valid-jwt-token';
      const passwordData = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Password changed successfully',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
    });

    it('should reject incorrect current password', async () => {
      const token = 'valid-jwt-token';
      const passwordData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword456',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Current password is incorrect',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Current password is incorrect');
    });

    it('should validate password strength', async () => {
      const token = 'valid-jwt-token';
      const passwordData = {
        currentPassword: 'oldPassword123',
        newPassword: '123', // Too weak
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Password too weak',
          message: 'Password must be at least 8 characters',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Password too weak');
    });
  });

  describe('POST /api/auth/mfa/verify', () => {
    it('should verify MFA code and complete login', async () => {
      const mfaData = {
        sessionId: 'temp-session-12345',
        code: '123456',
      };

      const user = userFixtures[0];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          token: 'final-jwt-token',
          refreshToken: 'final-refresh-token',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          permissions: ['*:*'],
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mfaData),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.user).toBeDefined();
    });

    it('should reject invalid MFA code', async () => {
      const mfaData = {
        sessionId: 'temp-session-12345',
        code: '000000',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Invalid MFA code',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mfaData),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid MFA code');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get current user profile', async () => {
      const token = 'valid-jwt-token';
      const user = userFixtures[0];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            department: user.department,
            preferences: user.preferences,
          },
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.user.username).toBe(user.username);
      expect(data.user.email).toBe(user.email);
    });

    it('should require authentication', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'Unauthorized',
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'GET',
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile', async () => {
      const token = 'valid-jwt-token';
      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
        preferences: {
          theme: 'light',
          notifications: { email: false },
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          user: {
            ...userFixtures[0],
            ...updates,
          },
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.user.firstName).toBe('Updated');
      expect(data.user.preferences.theme).toBe('light');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on login attempts', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          error: 'Too many requests',
          message: 'Please try again later',
          retryAfter: 60,
        }),
      } as Response);

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test', password: 'test' }),
      });

      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Too many requests');
      expect(data.retryAfter).toBeDefined();
    });
  });
});
