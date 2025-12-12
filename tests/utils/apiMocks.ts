import { vi } from 'vitest';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';
const GRAPHQL_URL = process.env.VITE_GRAPHQL_URL || 'http://localhost:3001/graphql';

/**
 * MSW request handlers
 */
export const handlers = [
  // Auth endpoints
  rest.post(`${BASE_URL}/api/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'analyst',
        },
      })
    );
  }),

  rest.post(`${BASE_URL}/api/auth/logout`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  // Threat endpoints
  rest.get(`${BASE_URL}/api/threats`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        threats: [],
        total: 0,
        page: 1,
        limit: 10,
      })
    );
  }),

  rest.get(`${BASE_URL}/api/threats/:id`, (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id,
        name: 'Test Threat',
        severity: 'high',
        status: 'active',
      })
    );
  }),

  rest.post(`${BASE_URL}/api/threats`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-threat-id',
        name: 'New Threat',
        severity: 'medium',
      })
    );
  }),

  // Case endpoints
  rest.get(`${BASE_URL}/api/cases`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        cases: [],
        total: 0,
        page: 1,
        limit: 10,
      })
    );
  }),

  rest.get(`${BASE_URL}/api/cases/:id`, (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id,
        title: 'Test Case',
        status: 'open',
        priority: 'high',
      })
    );
  }),

  // Dashboard endpoints
  rest.get(`${BASE_URL}/api/dashboard/stats`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        totalThreats: 0,
        activeCases: 0,
        criticalAlerts: 0,
        resolvedToday: 0,
      })
    );
  }),

  // Actor endpoints
  rest.get(`${BASE_URL}/api/actors`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        actors: [],
        total: 0,
      })
    );
  }),

  // GraphQL endpoint
  rest.post(GRAPHQL_URL, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: {},
      })
    );
  }),
];

/**
 * Setup MSW server
 */
export const server = setupServer(...handlers);

/**
 * Start the mock server
 */
export function startMockServer(): void {
  server.listen({ onUnhandledRequest: 'warn' });
}

/**
 * Stop the mock server
 */
export function stopMockServer(): void {
  server.close();
}

/**
 * Reset handlers between tests
 */
export function resetMockServer(): void {
  server.resetHandlers();
}

/**
 * Mock API client
 */
export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

/**
 * Create a mock API response
 */
export function createApiResponse<T>(data: T, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  };
}

/**
 * Create a mock API error
 */
export function createApiError(message: string, status = 500) {
  const error = new Error(message) as any;
  error.response = {
    data: { message },
    status,
    statusText: 'Error',
  };
  return error;
}

/**
 * Mock GraphQL response
 */
export function mockGraphQLResponse(data: any) {
  return rest.post(GRAPHQL_URL, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data }));
  });
}

/**
 * Mock GraphQL error
 */
export function mockGraphQLError(errors: any[]) {
  return rest.post(GRAPHQL_URL, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ errors }));
  });
}
