import { CONFIG } from '../config';
import { CircuitBreaker } from './utils/CircuitBreaker';
import { RateLimiter } from './algorithms/LeakyBucket';
import { Logger } from './logger';

const BASE_URL = '/api/v1';
const DEFAULT_TIMEOUT = 3000;

const circuitBreaker = new CircuitBreaker(5, 10000);
const rateLimiter = new RateLimiter(50, 10);

const inflightRequests = new Map<string, Promise<any>>();

export interface ApiOptions extends RequestInit {
  silent?: boolean;
  skipAuth?: boolean; // Skip authentication for public endpoints
}

/**
 * Token Storage using localStorage
 * In production, consider using httpOnly cookies for better security
 */
class TokenStorage {
  private static ACCESS_TOKEN_KEY = 'sentinel_access_token';
  private static REFRESH_TOKEN_KEY = 'sentinel_refresh_token';
  private static USER_KEY = 'sentinel_user';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static clear(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

/**
 * Enhanced API Client with JWT Authentication and Token Refresh
 */
class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  /**
   * Subscribe to token refresh events
   */
  private subscribeTokenRefresh(cb: (token: string) => void): void {
    this.refreshSubscribers.push(cb);
  }

  /**
   * Notify all subscribers when token is refreshed
   */
  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach(cb => cb(token));
    this.refreshSubscribers = [];
  }

  /**
   * Refresh the access token
   */
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = TokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newAccessToken = data.data?.accessToken || data.accessToken;

      TokenStorage.setAccessToken(newAccessToken);
      return newAccessToken;
    } catch (error) {
      // Refresh failed, clear tokens and redirect to login
      TokenStorage.clear();
      Logger.error('Token refresh failed', error);
      // Dispatch event for auth context to handle
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      throw error;
    }
  }

  /**
   * Main request method with authentication and retry logic
   */
  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const cacheKey = `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body)}`;

    // Request deduplication for GET requests
    if (options.method === 'GET' && inflightRequests.has(cacheKey)) {
      return inflightRequests.get(cacheKey) as Promise<T>;
    }

    // Client-side rate limiting
    if (!rateLimiter.tryAcquire(1)) {
      if (!options.silent) Logger.warn(`Rate limit exceeded`, { endpoint });
      throw new Error('Client-side Rate Limit Exceeded');
    }

    const requestPromise = this.executeRequest<T>(endpoint, options);

    if (options.method === 'GET') {
      inflightRequests.set(cacheKey, requestPromise);
      requestPromise.finally(() => inflightRequests.delete(cacheKey));
    }

    return requestPromise;
  }

  /**
   * Execute the actual HTTP request with circuit breaker
   */
  private async executeRequest<T>(endpoint: string, options: ApiOptions): Promise<T> {
    return circuitBreaker.execute(async () => {
      const url = `${BASE_URL}${endpoint}`;

      // Build headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      // Add authentication token unless skipAuth is true
      if (!options.skipAuth) {
        const token = TokenStorage.getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Handle 401 Unauthorized - attempt token refresh
        if (response.status === 401 && !options.skipAuth) {
          // If already refreshing, wait for the refresh to complete
          if (this.isRefreshing) {
            return new Promise<T>((resolve, reject) => {
              this.subscribeTokenRefresh(async (newToken: string) => {
                try {
                  // Retry the request with new token
                  const retryOptions = {
                    ...options,
                    headers: {
                      ...options.headers,
                      'Authorization': `Bearer ${newToken}`
                    }
                  };
                  const retryResponse = await fetch(url, retryOptions);
                  const retryData = await retryResponse.json();
                  resolve((retryData.data !== undefined ? retryData.data : retryData) as T);
                } catch (error) {
                  reject(error);
                }
              });
            });
          }

          // Attempt to refresh the token
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.isRefreshing = false;
            this.onRefreshed(newToken);

            // Retry the original request with new token
            return this.executeRequest<T>(endpoint, options);
          } catch (refreshError) {
            this.isRefreshing = false;
            throw new Error('Session expired. Please log in again.');
          }
        }

        // Handle other error responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `API Error: ${response.status} ${response.statusText}`;
          throw new Error(errorMessage);
        }

        const json = await response.json();
        return (json.data !== undefined ? json.data : json) as T;
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (!options.silent) {
          Logger.error('API Request Failed', { endpoint, error: error.message });
        }

        throw error;
      }
    });
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: unknown, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: unknown, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: unknown, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Authentication methods
   */
  async login(username: string, password: string): Promise<any> {
    const response = await this.post<any>('/auth/login', { username, password }, { skipAuth: true });

    if (response.accessToken || response.data?.accessToken) {
      const accessToken = response.accessToken || response.data.accessToken;
      const refreshToken = response.refreshToken || response.data?.refreshToken;
      const user = response.user || response.data?.user;

      TokenStorage.setAccessToken(accessToken);
      if (refreshToken) {
        TokenStorage.setRefreshToken(refreshToken);
      }
      if (user) {
        TokenStorage.setUser(user);
      }

      Logger.info('User logged in successfully', { username });
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout', {});
    } catch (error) {
      Logger.error('Logout request failed', error);
    } finally {
      TokenStorage.clear();
      Logger.info('User logged out');
    }
  }

  async getCurrentUser(): Promise<any> {
    return this.get('/auth/me');
  }

  getStoredUser(): any {
    return TokenStorage.getUser();
  }

  isAuthenticated(): boolean {
    return !!TokenStorage.getAccessToken();
  }
}

export const apiClient = new ApiClient();
export { TokenStorage };