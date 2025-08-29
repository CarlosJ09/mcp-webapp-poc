/**
 * @fileoverview Security middleware for MCP WebApp backend
 * Implements rate limiting, request validation, and security headers
 */

import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/app';
import { createLogger } from '../config/logger';

const logger = createLogger('Security');

/**
 * Rate limiting middleware
 * Prevents abuse and DoS attacks
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: config.security.rate_limit_window_ms, // 15 minutes default
  max: config.security.rate_limit_max_requests, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.ceil(config.security.rate_limit_window_ms / 1000),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req: Request) => {
    // Skip rate limiting in development if needed
    if (config.server.node_env === 'development') {
      return false; // Still apply rate limiting in dev for testing
    }
    return false;
  },
  handler: (req: Request) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
    });
  },
});

/**
 * Security headers middleware
 * Adds security-related HTTP headers
 */
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Remove server header for security
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (adjust as needed)
  res.setHeader(
    'Content-Security-Policy', 
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );
  
  next();
};

/**
 * Request validation middleware
 * Validates basic request structure and headers
 */
export const requestValidationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Check for required content-type on POST requests
  if (req.method === 'POST' && !req.is('application/json')) {
    logger.warn('Invalid content type', {
      method: req.method,
      contentType: req.get('Content-Type'),
      url: req.originalUrl,
    });
    
    res.status(400).json({
      error: 'Content-Type must be application/json for POST requests',
      code: 'INVALID_CONTENT_TYPE',
    });
    return;
  }

  // Validate JSON body size (Express default is 100kb)
  if (req.body && JSON.stringify(req.body).length > 1024 * 1024) { // 1MB limit
    logger.warn('Request body too large', {
      bodySize: JSON.stringify(req.body).length,
      url: req.originalUrl,
    });
    
    res.status(413).json({
      error: 'Request body too large',
      code: 'PAYLOAD_TOO_LARGE',
    });
    return;
  }

  next();
};

/**
 * Error handling middleware
 * Catches and formats errors consistently
 */
export const errorHandlerMiddleware = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  logger.error('Unhandled error', err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Don't leak error details in production
  const isDevelopment = config.server.node_env === 'development';
  
  res.status(err.statusCode || 500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: err.stack }),
  });
};

/**
 * 404 Not Found middleware
 * Handles routes that don't exist
 */
export const notFoundMiddleware = (req: Request, res: Response): void => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
  });
};
