
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Request Logging Middleware
 * Logs all incoming requests with timing information
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Attach request ID to request object
  (req as any).requestId = requestId;

  // Log incoming request
  logger.info('Incoming Request', {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    user: req.user?.username || 'anonymous',
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - startTime;

    logger.info('Outgoing Response', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      user: req.user?.username || 'anonymous',
    });

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Error Logging Middleware
 * Logs errors with full stack traces
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = (req as any).requestId;

  logger.error('Request Error', {
    requestId,
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack,
    user: req.user?.username || 'anonymous',
  });

  next(err);
};
