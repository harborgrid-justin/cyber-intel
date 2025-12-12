import { jest } from '@jest/globals';

// Setup environment variables for backend tests
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'sentinel_test';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.GEMINI_API_KEY = 'test-gemini-key';

// Mock console methods to reduce noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn((...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Deprecation') ||
       args[0].includes('SequelizeValidationError'))
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  });

  console.warn = jest.fn((...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('deprecated')
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test timeout
jest.setTimeout(15000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
