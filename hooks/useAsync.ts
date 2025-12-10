
import { useState, useCallback } from 'react';

export const useAsync = <T,>() => {
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (promise: Promise<T>) => {
    setStatus('PENDING');
    setValue(null);
    setError(null);
    try {
      const response = await promise;
      setValue(response);
      setStatus('SUCCESS');
      return response;
    } catch (error: any) {
      setError(error.message || 'Something went wrong');
      setStatus('ERROR');
      throw error;
    }
  }, []);

  return { execute, status, value, error };
};
