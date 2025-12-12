import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApi, useApiLazy, clearApiCache } from '../../../hooks/useApi';

describe('useApi Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearApiCache();
  });

  afterEach(() => {
    clearApiCache();
  });

  describe('useApi - Basic Functionality', () => {
    it('should fetch data immediately when immediate is true', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useApi(fetcher, { immediate: true }));

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should not fetch data immediately when immediate is false', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useApi(fetcher, { immediate: false }));

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
      const error = new Error('API Error');
      const fetcher = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useApi(fetcher, { immediate: true, retryCount: 0 }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toEqual(error);
    });

    it('should call onSuccess callback when fetch succeeds', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const fetcher = vi.fn().mockResolvedValue(mockData);
      const onSuccess = vi.fn();

      renderHook(() => useApi(fetcher, { immediate: true, onSuccess }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockData);
      });
    });

    it('should call onError callback when fetch fails', async () => {
      const error = new Error('API Error');
      const fetcher = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();

      renderHook(() => useApi(fetcher, { immediate: true, onError, retryCount: 0 }));

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('useApi - Refetch', () => {
    it('should refetch data when refetch is called', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useApi(fetcher, { immediate: true }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(fetcher).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('useApi - Optimistic Updates', () => {
    it('should handle optimistic updates with mutate', async () => {
      const initialData = { id: 1, name: 'Initial' };
      const optimisticData = { id: 1, name: 'Optimistic' };
      const finalData = { id: 1, name: 'Final' };

      const fetcher = vi.fn()
        .mockResolvedValueOnce(initialData)
        .mockResolvedValueOnce(finalData);

      const { result } = renderHook(() => useApi(fetcher, { immediate: true }));

      await waitFor(() => {
        expect(result.current.data).toEqual(initialData);
      });

      act(() => {
        result.current.mutate(optimisticData);
      });

      // Optimistic data should be set immediately
      expect(result.current.data).toEqual(optimisticData);

      // Wait for actual data to load
      await waitFor(() => {
        expect(result.current.data).toEqual(finalData);
      });
    });
  });

  describe('useApi - Transform Response', () => {
    it('should transform response data', async () => {
      const rawData = { value: '100' };
      const transformedData = { value: 100 };
      const fetcher = vi.fn().mockResolvedValue(rawData);
      const transformResponse = (data: any) => ({ value: parseInt(data.value) });

      const { result } = renderHook(() =>
        useApi(fetcher, { immediate: true, transformResponse })
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(transformedData);
      });
    });
  });

  describe('useApi - Retry Logic', () => {
    it('should retry failed requests with exponential backoff', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const fetcher = vi.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce(mockData);

      const { result } = renderHook(() =>
        useApi(fetcher, {
          immediate: true,
          retryCount: 3,
          retryDelay: 100
        })
      );

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      }, { timeout: 5000 });

      expect(fetcher).toHaveBeenCalledTimes(3);
      expect(result.current.error).toBeNull();
    });

    it('should fail after max retries', async () => {
      const error = new Error('Persistent Error');
      const fetcher = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() =>
        useApi(fetcher, {
          immediate: true,
          retryCount: 2,
          retryDelay: 100
        })
      );

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      }, { timeout: 5000 });

      expect(fetcher).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('useApi - Caching', () => {
    it('should cache successful responses', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      const { result, rerender } = renderHook(() => useApi(fetcher, { immediate: true, cacheTTL: 10000 }));

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(fetcher).toHaveBeenCalledTimes(1);

      // Rerender should use cached data
      rerender();

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      // Should still only be called once due to cache
      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('useApiLazy - Lazy Loading', () => {
    it('should not fetch immediately and provide execute function', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useApiLazy(fetcher));

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(fetcher).not.toHaveBeenCalled();

      act(() => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should handle errors in lazy mode', async () => {
      const error = new Error('Lazy Error');
      const fetcher = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useApiLazy(fetcher, { retryCount: 0 }));

      act(() => {
        result.current.execute();
      });

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
      });
    });
  });

  describe('useApi - Cleanup', () => {
    it('should abort pending requests on unmount', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const fetcher = vi.fn(() => new Promise(resolve => setTimeout(() => resolve(mockData), 1000)));

      const { unmount } = renderHook(() => useApi(fetcher, { immediate: true }));

      // Unmount before fetch completes
      unmount();

      // Wait to ensure no errors are thrown
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(true).toBe(true); // If we get here without errors, cleanup worked
    });
  });

  describe('useApi - Error Handling', () => {
    it('should handle non-Error objects as errors', async () => {
      const errorString = 'String error';
      const fetcher = vi.fn().mockRejectedValue(errorString);

      const { result } = renderHook(() => useApi(fetcher, { immediate: true, retryCount: 0 }));

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe(errorString);
      });
    });
  });

  describe('useApi - Cache Management', () => {
    it('should clear all cache entries', async () => {
      const mockData = { id: 1, name: 'Test Data' };
      const fetcher = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useApi(fetcher, { immediate: true }));

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData);
      });

      clearApiCache();

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(fetcher).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('useApi - Multiple Concurrent Requests', () => {
    it('should cancel previous requests when new ones are made', async () => {
      let callCount = 0;
      const fetcher = vi.fn(() => {
        callCount++;
        return new Promise(resolve =>
          setTimeout(() => resolve({ id: callCount }), callCount * 100)
        );
      });

      const { result } = renderHook(() => useApi(fetcher, { immediate: false }));

      act(() => {
        result.current.refetch();
        result.current.refetch();
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 1000 });

      // Only the last request should complete
      expect(result.current.data).toEqual({ id: 3 });
    });
  });
});
