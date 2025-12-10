
export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface AsyncResult<T> extends AsyncState<T> {
  execute: (promise: Promise<T>) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Executes promises safely, handling unmounting and error normalization.
 */
export class AsyncHandler {
  static async safeRun<T>(
    promise: Promise<T>,
    onSuccess: (data: T) => void,
    onError: (err: Error) => void,
    isMounted: () => boolean
  ): Promise<void> {
    try {
      const data = await promise;
      if (isMounted()) {
        onSuccess(data);
      }
    } catch (e) {
      if (isMounted()) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error('[AsyncHandler] Operation failed:', error);
        onError(error);
      }
    }
  }

  static createAbortController(): AbortController {
    return new AbortController();
  }
}
