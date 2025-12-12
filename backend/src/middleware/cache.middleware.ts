
import { Request, Response, NextFunction } from 'express';

export type CacheDuration = {
  short: number;    // 5 minutes
  medium: number;   // 15 minutes
  long: number;     // 1 hour
  veryLong: number; // 24 hours
};

export const CACHE_DURATIONS: CacheDuration = {
  short: 300,      // 5 minutes
  medium: 900,     // 15 minutes
  long: 3600,      // 1 hour
  veryLong: 86400, // 24 hours
};

/**
 * Cache Control Middleware
 * Sets appropriate cache headers for GET requests
 */
export const cacheControl = (duration: number, isPublic: boolean = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      const directive = isPublic ? 'public' : 'private';
      res.set('Cache-Control', `${directive}, max-age=${duration}`);
      res.set('Vary', 'Authorization');
    }
    next();
  };
};

/**
 * No Cache Middleware
 * Disables caching for sensitive endpoints
 */
export const noCache = (req: Request, res: Response, next: NextFunction) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
};

/**
 * ETag Support Middleware
 * Generates ETags for responses to enable conditional requests
 */
export const etag = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;

  res.send = function(data: any) {
    if (req.method === 'GET' && data) {
      const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64').substring(0, 27)}"`;
      res.set('ETag', etag);

      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return res;
      }
    }

    return originalSend.call(this, data);
  };

  next();
};
