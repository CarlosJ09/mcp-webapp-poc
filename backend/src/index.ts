/**
 * Application Entry Point
 * Bootstraps and starts the MCP Dashboard Backend Server
 */

import { Logger } from './shared/utils/Logger';
// import { App } from './app';
import { appConfig, getConfigSummary } from './shared/config/appConfig';

/**
 * Main function to start the application
 */
async function main(): Promise<void> {
  const logger = new Logger('Main');

  try {
    // Log startup information
    logger.info('Starting MCP Dashboard Backend Server', getConfigSummary());

    // TODO: Uncomment when container is fully implemented
    // const app = new App();
    // app.start();

    // Temporary simple server for testing
    const express = require('express');
    const cors = require('cors');
    const app = express();

    app.use(cors({
      origin: appConfig.cors.allowedOrigins,
      credentials: appConfig.cors.credentials,
      methods: appConfig.cors.methods,
      allowedHeaders: appConfig.cors.allowedHeaders
    }));

    app.use(express.json());

    // Health check endpoint
    app.get('/health', (req: any, res: any) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: appConfig.server.nodeEnv
      });
    });

    // Temporary dashboard endpoint
    app.get('/api/dashboard', (req: any, res: any) => {
      res.json({
        message: 'Dashboard API - New Architecture Implementation in Progress',
        timestamp: new Date().toISOString()
      });
    });

    app.listen(appConfig.server.port, () => {
      logger.info(`Temporary server started on port ${appConfig.server.port}`);
    });

  } catch (error) {
    logger.error('Failed to start application', error as Error);
    process.exit(1);
  }
}

/**
 * Handle process signals gracefully
 */
process.on('SIGTERM', () => {
  const logger = new Logger('Process');
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  const logger = new Logger('Process');
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the application
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error during startup:', error);
    process.exit(1);
  });
}
