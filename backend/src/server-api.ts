/**
 * @fileoverview Main entry point for MCP WebApp backend HTTP server
 * Implements Model Context Protocol server with Express.js
 */

import express from "express";
import { config, isDevelopment } from "./shared/config/app";
import { corsConfig, devCorsConfig } from "./shared/config/cors";
import { logger, createRequestLogger } from "./shared/config/logger";
import { 
  rateLimitMiddleware, 
  securityHeadersMiddleware, 
  requestValidationMiddleware, 
  errorHandlerMiddleware, 
  notFoundMiddleware 
} from "./presentation/middleware/security";
import { 
  healthCheckHandler, 
  livenessCheckHandler, 
  readinessCheckHandler 
} from "./presentation/middleware/health";
import mcpRoutes from "./presentation/routes/mcp-routes";
import mcpChatRoutes from "./routes/mcp-chat-routes";

/**
 * Initialize Express application
 */
const app = express();

/**
 * Global middleware setup
 */

// Request logging (before other middleware to catch all requests)
if (config.logging.enable_debug) {
  app.use(createRequestLogger('HTTP'));
}

// Security headers
app.use(securityHeadersMiddleware);

// Rate limiting (if enabled)
if (config.security.rate_limit_enabled) {
  app.use(rateLimitMiddleware);
  logger.info('Rate limiting enabled', {
    maxRequests: config.security.rate_limit_max_requests,
    windowMs: config.security.rate_limit_window_ms,
  });
}

// CORS configuration
const corsMiddleware = isDevelopment() ? devCorsConfig : corsConfig;
app.use(corsMiddleware);
logger.info('CORS configured', {
  mode: isDevelopment() ? 'development' : 'production',
  allowedOrigins: config.cors.allowed_origins,
});

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request validation
app.use(requestValidationMiddleware);

/**
 * Health check routes (before authentication)
 */
if (config.health_check.enabled) {
  app.get(config.health_check.endpoint, healthCheckHandler);
  app.get('/health/live', livenessCheckHandler);
  app.get('/health/ready', readinessCheckHandler);
  logger.info('Health check endpoints enabled', {
    healthEndpoint: config.health_check.endpoint,
    livenessEndpoint: '/health/live',
    readinessEndpoint: '/health/ready',
  });
}

/**
 * API routes
 */
app.use("/mcp", mcpRoutes);
app.use("/api/mcp", mcpChatRoutes);

/**
 * Error handling middleware (must be last)
 */
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

/**
 * Start server
 */
const startServer = (): void => {
  try {
    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info('🚀 MCP Server started successfully', {
        port: config.server.port,
        host: config.server.host,
        environment: config.server.node_env,
        version: config.mcp.server_version,
        url: `http://${config.server.host}:${config.server.port}`,
        healthCheck: config.health_check.enabled ? `http://${config.server.host}:${config.server.port}${config.health_check.endpoint}` : 'disabled',
      });
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string): void => {
      logger.info(`${signal} received, starting graceful shutdown`);
      
      server.close((err) => {
        if (err) {
          logger.error('Error during server shutdown', err);
          process.exit(1);
        }
        
        logger.info('Server closed successfully');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error);
      process.exit(1);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', new Error(`Unhandled rejection at: ${promise}, reason: ${reason}`));
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server', error instanceof Error ? error : new Error('Unknown error'));
    process.exit(1);
  }
};

// Start the server
startServer();
