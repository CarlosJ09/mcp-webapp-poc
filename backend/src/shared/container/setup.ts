/**
 * Dependency Injection Setup
 * Configures and registers all application dependencies
 * Follows Dependency Inversion Principle
 */

import { container } from './Container';

// Import interfaces and implementations
import { ILogger } from '../types/ILogger';
import { Logger } from '../utils/Logger';
import { IDashboardRepository, IExternalDataService } from '../../domain/interfaces/IRepositories';
import { IMcpServer, IMcpTransport, ISessionManager } from '../../domain/interfaces/IMcpServices';

// Import implementations
import { DashboardRepository } from '../../infrastructure/repositories/DashboardRepository';
import { ExternalDataService } from '../../infrastructure/external/ExternalDataService';
import { SessionManager } from '../../infrastructure/repositories/SessionManager';
import { McpServerImplementation, McpTransportImplementation } from '../../infrastructure/external/McpServerImplementation';

// Import use cases
import {
  GetDashboardDataUseCase,
  GetDashboardMetricsUseCase,
  GetSalesAnalyticsUseCase,
  GetCustomerAnalyticsUseCase,
  GetInventoryAnalyticsUseCase
} from '../../application/use-cases/DashboardUseCases';

import {
  InitializeMcpSessionUseCase,
  HandleMcpRequestUseCase,
  CloseMcpSessionUseCase,
  CleanupIdleSessionsUseCase,
  GetSessionStatisticsUseCase
} from '../../application/use-cases/McpUseCases';

// Import application services
import { DashboardApplicationService } from '../../application/services/DashboardApplicationService';
import { McpApplicationService } from '../../application/services/McpApplicationService';

// Import controllers
import { DashboardController } from '../../presentation/controllers/DashboardController';
import { McpController } from '../../presentation/controllers/McpController';

// Import configuration
import { appConfig } from '../config/appConfig';

/**
 * Configure all application dependencies
 */
export function configureDependencies(): void {
  // Configure logger
  const logger = Logger.create('MCP-Server');
  container.setLogger(logger);
  container.registerInstance<ILogger>('logger', logger);

  // Configure infrastructure layer
  configureInfrastructure();

  // Configure use cases
  configureUseCases();

  // Configure application services
  configureApplicationServices();

  // Configure controllers
  configureControllers();

  logger.info('Dependency injection container configured successfully', {
    registeredServices: container.getStats().registeredServices
  });
}

/**
 * Configure infrastructure layer dependencies
 */
function configureInfrastructure(): void {
  // External Data Service
  container.registerSingleton<IExternalDataService>('externalDataService', () => {
    const logger = container.get<ILogger>('logger');
    return new ExternalDataService({
      baseUrl: appConfig.externalServices.hostDataUrl,
      timeout: appConfig.externalServices.timeout,
      retryCount: appConfig.externalServices.retryCount,
      retryDelay: appConfig.externalServices.retryDelay
    }, logger.child('ExternalDataService'));
  });

  // Dashboard Repository
  container.registerSingleton<IDashboardRepository>('dashboardRepository', () => {
    const externalDataService = container.get<IExternalDataService>('externalDataService');
    const logger = container.get<ILogger>('logger');
    return new DashboardRepository(externalDataService, logger.child('DashboardRepository'));
  });

  // Session Manager
  container.registerSingleton<ISessionManager>('sessionManager', () => {
    const logger = container.get<ILogger>('logger');
    return new SessionManager(logger.child('SessionManager'), {
      maxIdleTime: appConfig.mcp.sessionMaxIdleTime,
      cleanupInterval: appConfig.mcp.sessionCleanupInterval
    });
  });

  // MCP Server
  container.registerSingleton<IMcpServer>('mcpServer', () => {
    const logger = container.get<ILogger>('logger');
    return new McpServerImplementation(logger.child('McpServer'));
  });

  // MCP Transport
  container.registerSingleton<IMcpTransport>('mcpTransport', () => {
    const logger = container.get<ILogger>('logger');
    return new McpTransportImplementation(logger.child('McpTransport'));
  });
}

/**
 * Configure use cases
 */
function configureUseCases(): void {
  // Dashboard Use Cases
  container.register('getDashboardDataUseCase', () => {
    const dashboardRepository = container.get<IDashboardRepository>('dashboardRepository');
    const logger = container.get<ILogger>('logger');
    return new GetDashboardDataUseCase(dashboardRepository, logger.child('GetDashboardDataUseCase'));
  });

  container.register('getDashboardMetricsUseCase', () => {
    const dashboardRepository = container.get<IDashboardRepository>('dashboardRepository');
    const logger = container.get<ILogger>('logger');
    return new GetDashboardMetricsUseCase(dashboardRepository, logger.child('GetDashboardMetricsUseCase'));
  });

  container.register('getSalesAnalyticsUseCase', () => {
    const dashboardRepository = container.get<IDashboardRepository>('dashboardRepository');
    const logger = container.get<ILogger>('logger');
    return new GetSalesAnalyticsUseCase(dashboardRepository, logger.child('GetSalesAnalyticsUseCase'));
  });

  container.register('getCustomerAnalyticsUseCase', () => {
    const dashboardRepository = container.get<IDashboardRepository>('dashboardRepository');
    const logger = container.get<ILogger>('logger');
    return new GetCustomerAnalyticsUseCase(dashboardRepository, logger.child('GetCustomerAnalyticsUseCase'));
  });

  container.register('getInventoryAnalyticsUseCase', () => {
    const dashboardRepository = container.get<IDashboardRepository>('dashboardRepository');
    const logger = container.get<ILogger>('logger');
    return new GetInventoryAnalyticsUseCase(dashboardRepository, logger.child('GetInventoryAnalyticsUseCase'));
  });

  // MCP Use Cases
  container.register('initializeMcpSessionUseCase', () => {
    const mcpServer = container.get<IMcpServer>('mcpServer');
    const mcpTransport = container.get<IMcpTransport>('mcpTransport');
    const sessionManager = container.get<ISessionManager>('sessionManager');
    const logger = container.get<ILogger>('logger');
    return new InitializeMcpSessionUseCase(mcpServer, mcpTransport, sessionManager, logger.child('InitializeMcpSessionUseCase'));
  });

  container.register('handleMcpRequestUseCase', () => {
    const sessionManager = container.get<ISessionManager>('sessionManager');
    const logger = container.get<ILogger>('logger');
    return new HandleMcpRequestUseCase(sessionManager, logger.child('HandleMcpRequestUseCase'));
  });

  container.register('closeMcpSessionUseCase', () => {
    const sessionManager = container.get<ISessionManager>('sessionManager');
    const logger = container.get<ILogger>('logger');
    return new CloseMcpSessionUseCase(sessionManager, logger.child('CloseMcpSessionUseCase'));
  });

  container.register('cleanupIdleSessionsUseCase', () => {
    const sessionManager = container.get<ISessionManager>('sessionManager');
    const logger = container.get<ILogger>('logger');
    return new CleanupIdleSessionsUseCase(sessionManager, logger.child('CleanupIdleSessionsUseCase'));
  });

  container.register('getSessionStatisticsUseCase', () => {
    const sessionManager = container.get<ISessionManager>('sessionManager');
    const logger = container.get<ILogger>('logger');
    return new GetSessionStatisticsUseCase(sessionManager, logger.child('GetSessionStatisticsUseCase'));
  });
}

/**
 * Configure application services
 */
function configureApplicationServices(): void {
  // Dashboard Application Service
  container.registerSingleton('dashboardApplicationService', () => {
    const getDashboardDataUseCase = container.get<GetDashboardDataUseCase>('getDashboardDataUseCase');
    const getDashboardMetricsUseCase = container.get<GetDashboardMetricsUseCase>('getDashboardMetricsUseCase');
    const getSalesAnalyticsUseCase = container.get<GetSalesAnalyticsUseCase>('getSalesAnalyticsUseCase');
    const getCustomerAnalyticsUseCase = container.get<GetCustomerAnalyticsUseCase>('getCustomerAnalyticsUseCase');
    const getInventoryAnalyticsUseCase = container.get<GetInventoryAnalyticsUseCase>('getInventoryAnalyticsUseCase');
    const logger = container.get<ILogger>('logger');
    
    return new DashboardApplicationService(
      getDashboardDataUseCase,
      getDashboardMetricsUseCase,
      getSalesAnalyticsUseCase,
      getCustomerAnalyticsUseCase,
      getInventoryAnalyticsUseCase,
      logger.child('DashboardApplicationService')
    );
  });

  // MCP Application Service
  container.registerSingleton('mcpApplicationService', () => {
    const initializeMcpSessionUseCase = container.get<InitializeMcpSessionUseCase>('initializeMcpSessionUseCase');
    const handleMcpRequestUseCase = container.get<HandleMcpRequestUseCase>('handleMcpRequestUseCase');
    const closeMcpSessionUseCase = container.get<CloseMcpSessionUseCase>('closeMcpSessionUseCase');
    const cleanupIdleSessionsUseCase = container.get<CleanupIdleSessionsUseCase>('cleanupIdleSessionsUseCase');
    const getSessionStatisticsUseCase = container.get<GetSessionStatisticsUseCase>('getSessionStatisticsUseCase');
    const logger = container.get<ILogger>('logger');
    
    return new McpApplicationService(
      initializeMcpSessionUseCase,
      handleMcpRequestUseCase,
      closeMcpSessionUseCase,
      cleanupIdleSessionsUseCase,
      getSessionStatisticsUseCase,
      logger.child('McpApplicationService'),
      appConfig.mcp.sessionCleanupInterval
    );
  });
}

/**
 * Configure controllers
 */
function configureControllers(): void {
  // Dashboard Controller
  container.registerSingleton('dashboardController', () => {
    const dashboardApplicationService = container.get<DashboardApplicationService>('dashboardApplicationService');
    const logger = container.get<ILogger>('logger');
    return new DashboardController(dashboardApplicationService, logger.child('DashboardController'));
  });

  // MCP Controller
  container.registerSingleton('mcpController', () => {
    const mcpApplicationService = container.get<McpApplicationService>('mcpApplicationService');
    const logger = container.get<ILogger>('logger');
    return new McpController(mcpApplicationService, logger.child('McpController'));
  });
}
