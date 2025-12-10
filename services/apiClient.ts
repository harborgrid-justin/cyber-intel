
import { CONFIG } from '../config';
import { CircuitBreaker } from './utils/CircuitBreaker';
import { RateLimiter } from './algorithms/LeakyBucket';

const BASE_URL = 'http://localhost:4000/api/v1';
const DEFAULT_TIMEOUT = 3000;

const circuitBreaker = new CircuitBreaker(5, 10000); 
const rateLimiter = new RateLimiter(50, 10); 

// Cache for in-flight requests (Deduplication)
const inflightRequests = new Map<string, Promise<any>>();

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cacheKey = `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body)}`;

    // 1. Deduplication: Return existing promise if request is already in flight
    if (options.method === 'GET' && inflightRequests.has(cacheKey)) {
        // console.debug(`[API] Deduplicated request for ${endpoint}`);
        return inflightRequests.get(cacheKey) as Promise<T>;
    }

    if (!rateLimiter.tryAcquire(1)) {
        console.warn(`[API] Rate limit exceeded for ${endpoint}, throttling...`);
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
          throw error;
        }
    }).finally(() => {
        // Clean up inflight map
        inflightRequests.delete(cacheKey);
    });

    if (options.method === 'GET') {
        inflightRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }
}

export const apiClient = new ApiClient();
