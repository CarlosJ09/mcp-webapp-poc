import express from 'express';
import cors from 'cors';
// TODO: Uncomment when container is fully implemented
// import { container } from './shared/config/Container';
import { DashboardController } from './presentation/controllers/DashboardController';
import { McpController } from './presentation/controllers/McpController';
import { Logger } from './shared/utils/Logger';
import { appConfig } from './shared/config/appConfig';

/**
 * Main Application Class
 * Bootstraps the application and configures middleware, routes, and dependencies
 */
export class App {
  private app: express.Application;
  private logger: Logger;

  constructor() {
    this.app = express();
    // TODO: Uncomment when container is fully implemented
    // this.logger = container.resolve('logger').child('App');
    this.logger = new Logger('App');
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware
   */
  private initializeMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: appConfig.cors.allowedOrigins,
      credentials: appConfig.cors.credentials,
      methods: appConfig.cors.methods,
      allowedHeaders: appConfig.cors.allowedHeaders
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: appConfig.security.maxBodySize }));
    this.app.use(express.urlencoded({ extended: true, limit: appConfig.security.maxBodySize }));

    // Request logging middleware
    this.app.use((req, res, next) => {
      const start = Date.now();
      
      this.logger.logRequest(req.method, req.url, req.body, {
        'user-agent': req.get('User-Agent'),
        'content-type': req.get('Content-Type')
      });

      res.on('finish', () => {
        const duration = Date.now() - start;
        this.logger.logResponse(res.statusCode, undefined, duration);
      });

      next();
    });
  }

  /**
   * Initialize application routes
   */
  private initializeRoutes(): void {
    // TODO: Uncomment when container is fully implemented
    // const dashboardController = container.resolve<DashboardController>('dashboardController');
    // const mcpController = container.resolve<McpController>('mcpController');

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // TODO: Implement routes when controllers are fully integrated
    // Dashboard routes
    /* this.app.get('/api/dashboard', (req, res, next) => 
      dashboardController.getDashboard(req, res, next));
    this.app.get('/api/dashboard/metrics', (req, res, next) => 
      dashboardController.getMetrics(req, res, next));
    this.app.get('/api/dashboard/sales-data', (req, res, next) => 
      dashboardController.getSalesData(req, res, next));
    this.app.get('/api/dashboard/customer-distribution', (req, res, next) => 
      dashboardController.getCustomerDistribution(req, res, next));
    this.app.get('/api/dashboard/inventory-levels', (req, res, next) => 
      dashboardController.getInventoryLevels(req, res, next));
    this.app.get('/api/dashboard/user-engagement', (req, res, next) => 
      dashboardController.getUserEngagement(req, res, next)); */

    // Temporary placeholder routes
    this.app.get('/api/dashboard', (req, res) => {
      res.json({
        message: 'Dashboard API - New Architecture Implementation in Progress',
        timestamp: new Date().toISOString()
      });
    });

    // MCP routes
    /* this.app.post('/api/mcp/initialize', (req, res, next) => 
      mcpController.initialize(req, res, next));
    this.app.post('/api/mcp/call-tool', (req, res, next) => 
      mcpController.callTool(req, res, next));
    this.app.get('/api/mcp/list-tools', (req, res, next) => 
      mcpController.listTools(req, res, next));
    this.app.post('/api/mcp/list-resources', (req, res, next) => 
      mcpController.listResources(req, res, next));
    this.app.post('/api/mcp/read-resource', (req, res, next) => 
      mcpController.readResource(req, res, next));
    this.app.delete('/api/mcp/sessions/:sessionId', (req, res, next) => 
      mcpController.closeSession(req, res, next)); */

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      this.logger.error('Unhandled error', error, {
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query
      });

      if (res.headersSent) {
        return next(error);
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: appConfig.server.nodeEnv === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    });

    // Uncaught exception handler
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception', error);
      process.exit(1);
    });

    // Unhandled rejection handler
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('Unhandled Rejection', reason as Error, { promise });
      process.exit(1);
    });
  }

  /**
   * Start the application server
   */
  public start(): void {
    const port = appConfig.server.port;
    
    this.app.listen(port, () => {
      this.logger.info(`Server started successfully`, {
        port,
        environment: appConfig.server.nodeEnv,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Get Express application instance (for testing)
   */
  public getApp(): express.Application {
    return this.app;
  }
}
