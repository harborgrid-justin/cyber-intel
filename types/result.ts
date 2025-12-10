
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ success: true, data });

export const fail = <E = Error>(error: E): Result<never, E> => ({ success: false, error });

export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.success) {
    return result.data;
  }
  // Explicit cast or check required for TS to narrow the else branch correctly in some strict configs
  const failed = result as { success: false; error: E };
  throw failed.error;
};

export class AppError extends Error {
  constructor(
    public message: string, 
    public code: 'NETWORK' | 'VALIDATION' | 'AUTH' | 'SYSTEM' = 'SYSTEM',
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}
