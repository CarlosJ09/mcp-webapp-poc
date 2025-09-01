/**
 * @fileoverview Health check middleware for MCP WebApp backend
 * Provides system health monitoring and status endpoints
 */

import { Request, Response } from 'express';
import { config } from '../../shared/config/app';
import { createLogger } from '../../shared/config/logger';

const logger = createLogger('HealthCheck');

/**
 * Health status interface
 */
interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      message?: string;
      duration?: number;
    };
  };
}

/**
 * Check external service health
 */
const checkExternalService = async (url: string, timeout = 5000): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    logger.debug('External service check failed', { url, error: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
};

/**
 * Check memory usage
 */
const checkMemoryUsage = (): { status: 'pass' | 'warn' | 'fail'; message?: string; usage: number } => {
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
  const usage = (heapUsedMB / heapTotalMB) * 100;
  
  if (usage > 90) {
    return { status: 'fail', message: 'High memory usage', usage };
  } else if (usage > 70) {
    return { status: 'warn', message: 'Elevated memory usage', usage };
  }
  
  return { status: 'pass', usage };
};

/**
 * Perform health checks
 */
const performHealthChecks = async (): Promise<HealthStatus> => {
  const startTime = Date.now();
  const checks: HealthStatus['checks'] = {};
  
  // Memory check
  const memoryCheck = checkMemoryUsage();
  checks.memory = {
    status: memoryCheck.status,
    message: memoryCheck.message,
    duration: 0, // Instant check
  };
  
  // External service check
  const externalServiceStart = Date.now();
  const externalServiceHealthy = await checkExternalService(config.external_services.hostdata_url);
  checks.external_service = {
    status: externalServiceHealthy ? 'pass' : 'fail',
    message: externalServiceHealthy ? 'External API accessible' : 'External API not accessible',
    duration: Date.now() - externalServiceStart,
  };
  
  // Process uptime check
  checks.uptime = {
    status: process.uptime() > 0 ? 'pass' : 'fail',
    message: `Process running for ${Math.floor(process.uptime())} seconds`,
    duration: 0,
  };
  
  // Determine overall status
  const failedChecks = Object.values(checks).filter(check => check.status === 'fail');
  const warnChecks = Object.values(checks).filter(check => check.status === 'warn');
  
  let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
  if (failedChecks.length > 0) {
    status = 'unhealthy';
  } else if (warnChecks.length > 0) {
    status = 'degraded';
  }
  
  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: config.mcp.server_version,
    environment: config.server.node_env,
    checks,
  };
};

/**
 * Health check endpoint handler
 */
export const healthCheckHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const health = await performHealthChecks();
    
    // Set appropriate HTTP status code
    let statusCode = 200;
    if (health.status === 'unhealthy') {
      statusCode = 503; // Service Unavailable
    } else if (health.status === 'degraded') {
      statusCode = 200; // OK but with warnings
    }
    
    res.status(statusCode).json(health);
    
    // Log health check results
    if (health.status !== 'healthy') {
      logger.warn('Health check issues detected', { 
        status: health.status,
        failedChecks: Object.entries(health.checks)
          .filter(([, check]) => check.status === 'fail')
          .map(([name]) => name),
      });
    }
    
  } catch (error) {
    logger.error('Health check failed', error instanceof Error ? error : new Error('Unknown error'));
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Simple liveness check (lighter than full health check)
 */
export const livenessCheckHandler = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
};

/**
 * Readiness check (checks if service is ready to handle requests)
 */
export const readinessCheckHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Basic readiness checks
    const checks = {
      config: config ? 'pass' : 'fail',
      memory: checkMemoryUsage().status !== 'fail' ? 'pass' : 'fail',
    };
    
    const allPassed = Object.values(checks).every(status => status === 'pass');
    
    res.status(allPassed ? 200 : 503).json({
      status: allPassed ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
    });
    
  } catch (error) {
    logger.error('Readiness check failed', error instanceof Error ? error : new Error('Unknown error'));
    
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed',
    });
  }
};
