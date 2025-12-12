import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { delay } from '../../utils/testUtils';

// Mock implementation of useAsync hook
function useAsync<T>(asyncFunction: () => Promise<T>, immediate = true) {
  const [status, setStatus] = React.useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [value, setValue] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = React.useCallback(async () => {
    setStatus('pending');
    setValue(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
      return response;
    } catch (error: any) {
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
}

const React = { useState: vi.fn(), useCallback: vi.fn(), useEffect: vi.fn() };

describe('useAsync hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful async operation', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');

    const { result } = renderHook(() => useAsync(mockFn));

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.value).toBe('success');
    expect(result.current.error).toBeNull();
  });

  it('should handle async operation error', async () => {
    const error = new Error('Test error');
    const mockFn = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useAsync(mockFn));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.error).toBe(error);
    expect(result.current.value).toBeNull();
  });

  it('should not execute immediately when immediate is false', () => {
    const mockFn = vi.fn().mockResolvedValue('success');

    const { result } = renderHook(() => useAsync(mockFn, false));

    expect(result.current.status).toBe('idle');
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should allow manual execution', async () => {
    const mockFn = vi.fn().mockResolvedValue('manual success');

    const { result } = renderHook(() => useAsync(mockFn, false));

    expect(result.current.status).toBe('idle');

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.value).toBe('manual success');
  });

  it('should handle multiple executions', async () => {
    let callCount = 0;
    const mockFn = vi.fn().mockImplementation(async () => {
      callCount++;
      return `call ${callCount}`;
    });

    const { result } = renderHook(() => useAsync(mockFn, false));

    await result.current.execute();
    expect(result.current.value).toBe('call 1');

    await result.current.execute();
    expect(result.current.value).toBe('call 2');
  });
});
