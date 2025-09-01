/**
 * Application Configuration
 * Centralized configuration management following Single Responsibility Principle
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Server Configuration
 */
export interface ServerConfig {
  readonly nodeEnv: string;
  readonly port: number;
  readonly host: string;
  readonly maxBodySize: string;
}

/**
 * External Services Configuration
 */
export interface ExternalServicesConfig {
  readonly hostDataUrl: string;
  readonly timeout: number;
  readonly retryCount: number;
  readonly retryDelay: number;
}

/**
 * CORS Configuration
 */
export interface CorsConfig {
  readonly allowedOrigins: string[];
  readonly credentials: boolean;
  readonly methods: string[];
  readonly allowedHeaders: string[];
}

/**
 * MCP Protocol Configuration
 */
export interface McpConfig {
  readonly protocolVersion: string;
  readonly serverName: string;
  readonly serverVersion: string;
  readonly sessionMaxIdleTime: number;
  readonly sessionCleanupInterval: number;
}

/**
 * Logging Configuration
 */
export interface LoggingConfig {
  readonly level: string;
  readonly format: string;
  readonly enableDebug: boolean;
  readonly enableCorsDebug: boolean;
}

/**
 * Health Check Configuration
 */
export interface HealthCheckConfig {
  readonly enabled: boolean;
  readonly endpoint: string;
}

/**
 * Security Configuration
 */
export interface SecurityConfig {
  readonly rateLimitEnabled: boolean;
  readonly rateLimitMaxRequests: number;
  readonly rateLimitWindowMs: number;
  readonly enableSecurityHeaders: boolean;
  readonly maxBodySize: string;
}

/**
 * Complete Application Configuration
 */
export interface AppConfig {
  readonly server: ServerConfig;
  readonly externalServices: ExternalServicesConfig;
  readonly cors: CorsConfig;
  readonly mcp: McpConfig;
  readonly logging: LoggingConfig;
  readonly healthCheck: HealthCheckConfig;
  readonly security: SecurityConfig;
}

/**
 * Environment variable getters with type safety and defaults
 */
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  return value ? parseInt(value, 10) : defaultValue;
};

const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key];
  return value ? value.toLowerCase() === 'true' : defaultValue;
};

const parseCommaSeparated = (value: string = ''): string[] => {
  return value.split(',').map(item => item.trim()).filter(Boolean);
};

/**
 * Application Configuration Instance
 */
export const appConfig: AppConfig = {
  server: {
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    port: getEnvNumber('PORT', 3001),
    host: getEnvVar('HOST', '0.0.0.0'),
    maxBodySize: getEnvVar('MAX_BODY_SIZE', '1mb')
  },
  
  externalServices: {
    hostDataUrl: getEnvVar('HOSTDATA_URL', 'http://hostdata.local:8080'),
    timeout: getEnvNumber('EXTERNAL_API_TIMEOUT', 30000),
    retryCount: getEnvNumber('EXTERNAL_API_RETRY_COUNT', 3),
    retryDelay: getEnvNumber('EXTERNAL_API_RETRY_DELAY', 1000)
  },
  
  cors: {
    allowedOrigins: parseCommaSeparated(getEnvVar('ALLOWED_ORIGINS', 'http://localhost:3002,http://localhost:3001')),
    credentials: getEnvBoolean('CORS_CREDENTIALS', true),
    methods: parseCommaSeparated(getEnvVar('CORS_METHODS', 'GET,POST,PUT,DELETE,OPTIONS')),
    allowedHeaders: parseCommaSeparated(getEnvVar('CORS_HEADERS', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,MCP-Session-ID'))
  },
  
  mcp: {
    protocolVersion: getEnvVar('MCP_PROTOCOL_VERSION', '2024-11-05'),
    serverName: getEnvVar('MCP_SERVER_NAME', 'dashboard-mcp-server'),
    serverVersion: getEnvVar('MCP_SERVER_VERSION', '1.0.0'),
    sessionMaxIdleTime: getEnvNumber('MCP_SESSION_MAX_IDLE_TIME', 600000), // 10 minutes
    sessionCleanupInterval: getEnvNumber('MCP_SESSION_CLEANUP_INTERVAL', 300000) // 5 minutes
  },
  
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
    format: getEnvVar('LOG_FORMAT', 'json'),
    enableDebug: getEnvBoolean('ENABLE_DEBUG_LOGS', true),
    enableCorsDebug: getEnvBoolean('ENABLE_CORS_DEBUG', false)
  },
  
  healthCheck: {
    enabled: getEnvBoolean('HEALTH_CHECK_ENABLED', true),
    endpoint: getEnvVar('HEALTH_CHECK_ENDPOINT', '/health')
  },
  
  security: {
    rateLimitEnabled: getEnvBoolean('RATE_LIMIT_ENABLED', true),
    rateLimitMaxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
    rateLimitWindowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
    enableSecurityHeaders: getEnvBoolean('ENABLE_SECURITY_HEADERS', true),
    maxBodySize: getEnvVar('MAX_BODY_SIZE', '1mb')
  }
};

/**
 * Configuration Validation
 */
export const validateConfig = (): void => {
  const requiredVars = [
    'externalServices.hostDataUrl',
    'server.port',
    'mcp.protocolVersion',
  ];
  
  const missing = requiredVars.filter(key => {
    const keys = key.split('.');
    let obj: any = appConfig;
    
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

/**
 * Environment Helper Functions
 */
export const isDevelopment = (): boolean => appConfig.server.nodeEnv === 'development';
export const isProduction = (): boolean => appConfig.server.nodeEnv === 'production';
export const isTest = (): boolean => appConfig.server.nodeEnv === 'test';

/**
 * Configuration Summary for Logging
 */
export const getConfigSummary = () => ({
  environment: appConfig.server.nodeEnv,
  port: appConfig.server.port,
  host: appConfig.server.host,
  externalApiUrl: appConfig.externalServices.hostDataUrl,
  mcpVersion: appConfig.mcp.protocolVersion,
  logLevel: appConfig.logging.level,
  rateLimitEnabled: appConfig.security.rateLimitEnabled,
  healthCheckEnabled: appConfig.healthCheck.enabled,
  allowedOrigins: appConfig.cors.allowedOrigins.length,
  securityHeadersEnabled: appConfig.security.enableSecurityHeaders
});

// Validate configuration on module load
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation failed:', (error as Error).message);
  process.exit(1);
}
