
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface Metrics {
  totalRequests: number;
  requestsByMethod: Map<string, number>;
  requestsByStatus: Map<number, number>;
  requestsByEndpoint: Map<string, number>;
  averageResponseTime: number;
  totalResponseTime: number;
  errors: number;
}

class MetricsCollector {
  private metrics: Metrics = {
    totalRequests: 0,
    requestsByMethod: new Map(),
    requestsByStatus: new Map(),
    requestsByEndpoint: new Map(),
    averageResponseTime: 0,
    totalResponseTime: 0,
    errors: 0,
  };

  recordRequest(method: string, endpoint: string, statusCode: number, duration: number) {
    this.metrics.totalRequests++;

    // By method
    this.metrics.requestsByMethod.set(
      method,
      (this.metrics.requestsByMethod.get(method) || 0) + 1
    );

    // By status
    this.metrics.requestsByStatus.set(
      statusCode,
      (this.metrics.requestsByStatus.get(statusCode) || 0) + 1
    );

    // By endpoint
    this.metrics.requestsByEndpoint.set(
      endpoint,
      (this.metrics.requestsByEndpoint.get(endpoint) || 0) + 1
    );

    // Response time
    this.metrics.totalResponseTime += duration;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.totalRequests;

    // Errors
    if (statusCode >= 400) {
      this.metrics.errors++;
    }
  }

  getMetrics(): Metrics {
    return {
      ...this.metrics,
      requestsByMethod: this.metrics.requestsByMethod,
      requestsByStatus: this.metrics.requestsByStatus,
      requestsByEndpoint: this.metrics.requestsByEndpoint,
    };
  }

  getMetricsSummary() {
    return {
      totalRequests: this.metrics.totalRequests,
      totalErrors: this.metrics.errors,
      errorRate: this.metrics.totalRequests > 0
        ? ((this.metrics.errors / this.metrics.totalRequests) * 100).toFixed(2) + '%'
        : '0%',
      averageResponseTime: `${this.metrics.averageResponseTime.toFixed(2)}ms`,
      requestsByMethod: Object.fromEntries(this.metrics.requestsByMethod),
      requestsByStatus: Object.fromEntries(this.metrics.requestsByStatus),
      topEndpoints: Array.from(this.metrics.requestsByEndpoint.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([endpoint, count]) => ({ endpoint, count })),
    };
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      requestsByMethod: new Map(),
      requestsByStatus: new Map(),
      requestsByEndpoint: new Map(),
      averageResponseTime: 0,
      totalResponseTime: 0,
      errors: 0,
    };
  }
}

export const metricsCollector = new MetricsCollector();

/**
 * Metrics Collection Middleware
 * Collects performance and usage metrics
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Capture response
  const originalSend = res.send;
  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    const endpoint = `${req.method} ${req.route?.path || req.path}`;

    metricsCollector.recordRequest(
      req.method,
      endpoint,
      res.statusCode,
      duration
    );

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow Request Detected', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        user: req.user?.username || 'anonymous',
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Metrics Endpoint Handler
 * Returns current metrics summary
 */
export const getMetrics = (req: Request, res: Response) => {
  const summary = metricsCollector.getMetricsSummary();
  res.json({ data: summary });
};
