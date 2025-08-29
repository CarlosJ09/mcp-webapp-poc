/**
 * @fileoverview Centralized application configuration management
 * Handles environment variables, validation, and configuration defaults
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Server configuration interface
 */
interface ServerConfig {
  readonly node_env: string;
  readonly port: number;
  readonly host: string;
}

/**
 * External services configuration interface
 */
interface ExternalServicesConfig {
  readonly hostdata_url: string;
}

/**
 * CORS configuration interface  
 */
interface CorsConfig {
  readonly allowed_origins: string[];
}

/**
 * MCP protocol configuration interface
 */
interface McpConfig {
  readonly protocol_version: string;
  readonly server_name: string;
  readonly server_version: string;
}

/**
 * Logging configuration interface
 */
interface LoggingConfig {
  readonly level: string;
  readonly format: string;
  readonly enable_debug: boolean;
  readonly enable_cors_debug: boolean;
}

/**
 * Health check configuration interface
 */
interface HealthCheckConfig {
  readonly enabled: boolean;
  readonly endpoint: string;
}

/**
 * Security configuration interface
 */
interface SecurityConfig {
  readonly rate_limit_enabled: boolean;
  readonly rate_limit_max_requests: number;
  readonly rate_limit_window_ms: number;
}

/**
 * Complete application configuration interface
 */
interface AppConfig {
  readonly server: ServerConfig;
  readonly external_services: ExternalServicesConfig;
  readonly cors: CorsConfig;
  readonly mcp: McpConfig;
  readonly logging: LoggingConfig;
  readonly health_check: HealthCheckConfig;
  readonly security: SecurityConfig;
}

/**
 * Parse comma-separated string into array
 */
const parseCommaSeparated = (value: string = ''): string[] => {
  return value.split(',').map(item => item.trim()).filter(Boolean);
};

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

/**
 * Get numeric environment variable with fallback
 */
const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

/**
 * Get boolean environment variable with fallback
 */
const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key]?.toLowerCase();
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
};

/**
 * Application configuration singleton
 */
export const config: AppConfig = {
  server: {
    node_env: getEnvVar('NODE_ENV', 'development'),
    port: getEnvNumber('PORT', 3000),
    host: getEnvVar('HOST', 'localhost'),
  },
  
  external_services: {
    hostdata_url: getEnvVar('HOSTDATA_URL', 'https://server-api-thryv.onrender.com'),
  },
  
  cors: {
    allowed_origins: parseCommaSeparated(getEnvVar('ALLOWED_ORIGINS', 'http://localhost:3002,http://localhost:3001')),
  },
  
  mcp: {
    protocol_version: getEnvVar('MCP_PROTOCOL_VERSION', '2024-11-05'),
    server_name: getEnvVar('MCP_SERVER_NAME', 'dashboard-mcp-server'),
    server_version: getEnvVar('MCP_SERVER_VERSION', '1.0.0'),
  },
  
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
    format: getEnvVar('LOG_FORMAT', 'json'),
    enable_debug: getEnvBoolean('ENABLE_DEBUG_LOGS', true),
    enable_cors_debug: getEnvBoolean('ENABLE_CORS_DEBUG', false),
  },
  
  health_check: {
    enabled: getEnvBoolean('HEALTH_CHECK_ENABLED', true),
    endpoint: getEnvVar('HEALTH_CHECK_ENDPOINT', '/health'),
  },
  
  security: {
    rate_limit_enabled: getEnvBoolean('RATE_LIMIT_ENABLED', true),
    rate_limit_max_requests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
    rate_limit_window_ms: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000),
  },
};

/**
 * Validate required configuration
 */
export const validateConfig = (): void => {
  const requiredVars = [
    'external_services.hostdata_url',
    'server.port',
    'mcp.protocol_version',
  ];
  
  const missing = requiredVars.filter(key => {
    const keys = key.split('.');
    let obj: any = config;
    
    for (const k of keys) {
      if (obj[k] === undefined || obj[k] === '') {
        return true;
      }
      obj = obj[k];
    }
    return false;
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
};

// Validate configuration on module load
validateConfig();

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => config.server.node_env === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => config.server.node_env === 'production';

/**
 * Check if running in test mode
 */
export const isTest = (): boolean => config.server.node_env === 'test';
