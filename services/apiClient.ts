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
}

class ApiClient {
  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const cacheKey = `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body)}`;

    if (options.method === 'GET' && inflightRequests.has(cacheKey)) {
        return inflightRequests.get(cacheKey) as Promise<T>;
    }

    if (!rateLimiter.tryAcquire(1)) {
        if (!options.silent) Logger.warn(`Rate limit exceeded`, { endpoint });
        throw new Error('Client-side Rate Limit Exceeded');
    }

    const requestPromise = circuitBreaker.execute(async () => {
        const url = `${BASE_URL}${endpoint}`;
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
          ...options.headers,
        };

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

        try {
          const response = await fetch(url, { ...options, headers, signal: controller.signal });
          clearTimeout(id);

          if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
          
          const json = await response.json();
          return (json.data !== undefined ? json.data : json) as T;
        } catch (error: any) {
          clearTimeout(id);
          if (!options.silent) {
            Logger.error('API Request Failed', { endpoint, error: error.message });
          }
          throw error;
        }
    }).finally(() => {
        inflightRequests.delete(cacheKey);
    });

    if (options.method === 'GET') {
        inflightRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }

  get<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown, options: ApiOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
  }
}

export const apiClient = new ApiClient();