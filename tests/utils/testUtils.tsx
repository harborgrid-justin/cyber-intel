import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { vi } from 'vitest';

// Mock providers that might be needed
interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  return <>{children}</>;
};

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Create a mock API response
 */
export function createMockResponse<T>(data: T, delay = 0): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

/**
 * Create a mock API error
 */
export function createMockError(message: string, delay = 0): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
}

/**
 * Wait for async operations to complete
 */
export async function waitForAsync(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/**
 * Create a mock fetch response
 */
export function mockFetchResponse<T>(data: T, status = 200): void {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    redirected: false,
    statusText: 'OK',
    type: 'basic',
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
  } as Response);
}

/**
 * Create a mock fetch error
 */
export function mockFetchError(message: string): void {
  global.fetch = vi.fn().mockRejectedValue(new Error(message));
}

/**
 * Simulate user delay (for testing async operations)
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get mock local storage
 */
export function getMockLocalStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    length: Object.keys(store).length,
  };
}

/**
 * Create a mock event
 */
export function createMockEvent<T extends Event>(
  type: string,
  properties?: Partial<T>
): T {
  const event = new Event(type) as T;
  if (properties) {
    Object.assign(event, properties);
  }
  return event;
}

/**
 * Suppress console errors/warnings during tests
 */
export function suppressConsole(methods: Array<'log' | 'error' | 'warn' | 'info'> = ['error', 'warn']): () => void {
  const originalMethods: Record<string, any> = {};

  methods.forEach(method => {
    originalMethods[method] = console[method];
    console[method] = vi.fn();
  });

  return () => {
    methods.forEach(method => {
      console[method] = originalMethods[method];
    });
  };
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
