/**
 * Application Constants
 * Centralized constants for the application
 */

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  PARTIAL_CONTENT: 206,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

/**
 * Application Error Codes
 */
export const ERROR_CODES = {
  // General errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  
  // Authentication/Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Request validation
  INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  URL_TOO_LONG: 'URL_TOO_LONG',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // MCP specific
  MCP_SESSION_NOT_FOUND: 'MCP_SESSION_NOT_FOUND',
  MCP_INVALID_REQUEST: 'MCP_INVALID_REQUEST',
  MCP_CONNECTION_ERROR: 'MCP_CONNECTION_ERROR',
  
  // Dashboard specific
  DASHBOARD_DATA_ERROR: 'DASHBOARD_DATA_ERROR',
  DASHBOARD_METRICS_ERROR: 'DASHBOARD_METRICS_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  
  // Service health
  SERVICE_DEGRADED: 'SERVICE_DEGRADED',
  SERVICE_UNHEALTHY: 'SERVICE_UNHEALTHY'
} as const;

/**
 * MCP Protocol Constants
 */
export const MCP_CONSTANTS = {
  PROTOCOL_VERSION: '2024-11-05',
  SERVER_NAME: 'dashboard-mcp-server',
  SERVER_VERSION: '1.0.0',
  
  // JSON-RPC constants
  JSONRPC_VERSION: '2.0',
  
  // Method names
  METHODS: {
    INITIALIZE: 'initialize',
    INITIALIZED: 'initialized',
    RESOURCES_LIST: 'resources/list',
    RESOURCES_READ: 'resources/read',
    TOOLS_LIST: 'tools/list',
    TOOLS_CALL: 'tools/call',
    PROMPTS_LIST: 'prompts/list',
    PROMPTS_GET: 'prompts/get'
  },
  
  // Session constants
  SESSION_HEADER: 'mcp-session-id',
  DEFAULT_MAX_IDLE_TIME: 600000, // 10 minutes
  DEFAULT_CLEANUP_INTERVAL: 300000 // 5 minutes
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Health checks
  HEALTH: '/health',
  LIVENESS: '/health/live',
  READINESS: '/health/ready',
  
  // MCP endpoints
  MCP_BASE: '/mcp',
  MCP_STATS: '/mcp/stats',
  MCP_CLEANUP: '/mcp/cleanup',
  MCP_HEALTH: '/mcp/health',
  
  // Dashboard endpoints
  DASHBOARD_BASE: '/api/dashboard',
  DASHBOARD_METRICS: '/api/dashboard/metrics',
  DASHBOARD_SALES: '/api/dashboard/sales',
  DASHBOARD_CUSTOMERS: '/api/dashboard/customers',
  DASHBOARD_INVENTORY: '/api/dashboard/inventory',
  DASHBOARD_HEALTH: '/api/dashboard/health'
} as const;

/**
 * Default Values
 */
export const DEFAULTS = {
  // Server defaults
  PORT: 3001,
  HOST: '0.0.0.0',
  MAX_BODY_SIZE: '1mb',
  
  // External API defaults
  API_TIMEOUT: 30000, // 30 seconds
  API_RETRY_COUNT: 3,
  API_RETRY_DELAY: 1000, // 1 second
  
  // Rate limiting defaults
  RATE_LIMIT_MAX_REQUESTS: 100,
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  
  // Logging defaults
  LOG_LEVEL: 'info',
  LOG_FORMAT: 'json',
  
  // Dashboard defaults
  LOW_STOCK_THRESHOLD: 10,
  CUSTOMER_SEGMENTATION_MULTIPLIER: 2
} as const;

/**
 * Regular Expressions
 */
export const REGEX_PATTERNS = {
  // Period validation (YYYY, YYYY-MM, YYYY-MM-DD)
  PERIOD: /^\d{4}(-\d{2})?(-\d{2})?$/,
  
  // Email validation
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // UUID validation
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Semver validation
  SEMVER: /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
} as const;

/**
 * Content Types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
  MULTIPART_FORM: 'multipart/form-data'
} as const;

/**
 * Cache TTL Values (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 1 day
} as const;

/**
 * Environment Types
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
  STAGING: 'staging'
} as const;

/**
 * Service Health Status
 */
export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy'
} as const;
