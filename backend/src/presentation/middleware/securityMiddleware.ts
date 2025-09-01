/**
 * Security Middleware
 * Modern security middleware following security best practices
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { ILogger } from '../../shared/types/ILogger';

/**
 * Security Configuration Interface
 */
interface SecurityConfig {
  readonly rateLimitEnabled: boolean;
  readonly rateLimitMaxRequests: number;
  readonly rateLimitWindowMs: number;
  readonly maxBodySize: string;
  readonly enableSecurityHeaders: boolean;
}

/**
 * Create rate limiting middleware
 */
export function createRateLimitMiddleware(
  config: SecurityConfig,
  logger: ILogger
) {
  if (!config.rateLimitEnabled) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  return rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    message: {
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: config.rateLimitWindowMs / 1000
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        url: req.originalUrl,
        userAgent: req.get('User-Agent')
      });

      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(config.rateLimitWindowMs / 1000),
        timestamp: new Date().toISOString()
      });
    },
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.originalUrl.includes('/health');
    }
  });
}

/**
 * Security headers middleware
 */
export function securityHeadersMiddleware(
  config: SecurityConfig,
  logger: ILogger
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!config.enableSecurityHeaders) {
      return next();
    }

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
    );

    logger.debug('Security headers applied', {
      url: req.originalUrl,
      method: req.method
    });

    next();
  };
}

/**
 * Request validation middleware
 */
export function requestValidationMiddleware(
  config: SecurityConfig,
  logger: ILogger
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate content type for POST requests
      if (req.method === 'POST' && !req.is('application/json')) {
        logger.warn('Invalid content type for POST request', {
          method: req.method,
          contentType: req.get('Content-Type'),
          url: req.originalUrl,
          ip: req.ip
        });

        res.status(400).json({
          success: false,
          error: 'Content-Type must be application/json for POST requests',
          code: 'INVALID_CONTENT_TYPE',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate body size
      if (req.body && typeof req.body === 'object') {
        const bodySize = JSON.stringify(req.body).length;
        const maxSize = parseInt(config.maxBodySize.replace(/\D/g, '')) * 1024; // Convert to bytes

        if (bodySize > maxSize) {
          logger.warn('Request body too large', {
            bodySize,
            maxSize,
            url: req.originalUrl,
            ip: req.ip
          });

          res.status(413).json({
            success: false,
            error: `Request body too large. Maximum size is ${config.maxBodySize}`,
            code: 'PAYLOAD_TOO_LARGE',
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      // Validate URL length
      if (req.originalUrl.length > 2048) {
        logger.warn('URL too long', {
          urlLength: req.originalUrl.length,
          url: req.originalUrl.substring(0, 100) + '...',
          ip: req.ip
        });

        res.status(414).json({
          success: false,
          error: 'URL too long',
          code: 'URL_TOO_LONG',
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.debug('Request validation passed', {
        method: req.method,
        url: req.originalUrl,
        contentType: req.get('Content-Type'),
        bodySize: req.body ? JSON.stringify(req.body).length : 0
      });

      next();
    } catch (error) {
      logger.error('Request validation error', error as Error, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
      });

      res.status(400).json({
        success: false,
        error: 'Invalid request format',
        code: 'REQUEST_VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Error handler middleware
 */
export function errorHandlerMiddleware(
  logger: ILogger,
  isDevelopment: boolean = false
) {
  return (err: any, req: Request, res: Response, next: NextFunction): void => {
    // Log the error
    logger.error('Unhandled error', err, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      stack: err.stack
    });

    // Don't expose error details in production
    const statusCode = err.statusCode || err.status || 500;
    const message = isDevelopment ? err.message : 'Internal server error';

    res.status(statusCode).json({
      success: false,
      error: message,
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      ...(isDevelopment && { stack: err.stack })
    });
  };
}

/**
 * 404 Not Found middleware
 */
export function notFoundMiddleware(logger: ILogger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    logger.warn('Route not found', {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(404).json({
      success: false,
      error: 'Route not found',
      code: 'ROUTE_NOT_FOUND',
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    });
  };
}

/**
 * Request logging middleware
 */
export function requestLoggingMiddleware(
  logger: ILogger,
  logLevel: 'debug' | 'info' = 'debug'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    
    // Log request
    const requestData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentType: req.get('Content-Type'),
      contentLength: req.get('Content-Length')
    };

    if (logLevel === 'info') {
      logger.info('Incoming request', requestData);
    } else {
      logger.debug('Incoming request', requestData);
    }

    // Override res.end to log response
    const originalEnd = res.end.bind(res);
    res.end = function(chunk?: any, encoding?: any, cb?: any): Response {
      const duration = Date.now() - start;
      
      const responseData = {
        ...requestData,
        statusCode: res.statusCode,
        contentLength: res.get('Content-Length'),
        duration: `${duration}ms`
      };

      if (logLevel === 'info') {
        logger.info('Request completed', responseData);
      } else {
        logger.debug('Request completed', responseData);
      }

      return originalEnd(chunk, encoding, cb);
    };

    next();
  };
}
