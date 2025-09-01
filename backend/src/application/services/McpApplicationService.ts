/**
 * MCP Application Service
 * Orchestrates MCP protocol operations and session management
 */

import { 
  InitializeMcpSessionUseCase,
  HandleMcpRequestUseCase,
  CloseMcpSessionUseCase,
  CleanupIdleSessionsUseCase,
  GetSessionStatisticsUseCase
} from '../use-cases/McpUseCases';
import { ILogger } from '../../shared/types/ILogger';

/**
 * MCP Application Service
 * High-level orchestration of MCP operations
 */
export class McpApplicationService {
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly initializeMcpSessionUseCase: InitializeMcpSessionUseCase,
    private readonly handleMcpRequestUseCase: HandleMcpRequestUseCase,
    private readonly closeMcpSessionUseCase: CloseMcpSessionUseCase,
    private readonly cleanupIdleSessionsUseCase: CleanupIdleSessionsUseCase,
    private readonly getSessionStatisticsUseCase: GetSessionStatisticsUseCase,
    private readonly logger: ILogger,
    private readonly cleanupIntervalMs: number = 300000 // 5 minutes
  ) {
    this.startPeriodicCleanup();
  }

  /**
   * Initialize new MCP session
   */
  async initializeSession(requestBody: any): Promise<{ sessionId: string; status: string }> {
    try {
      const sessionId = await this.initializeMcpSessionUseCase.execute(requestBody);
      
      return {
        sessionId,
        status: 'initialized'
      };
    } catch (error) {
      this.logger.error('Failed to initialize MCP session', error as Error);
      throw error;
    }
  }

  /**
   * Handle MCP request for existing session
   */
  async handleRequest(sessionId: string, req: any, res: any, body: any): Promise<void> {
    try {
      await this.handleMcpRequestUseCase.execute(sessionId, req, res, body);
    } catch (error) {
      this.logger.error('Failed to handle MCP request', error as Error, { sessionId });
      throw error;
    }
  }

  /**
   * Close MCP session
   */
  async closeSession(sessionId: string, reason?: string): Promise<void> {
    try {
      await this.closeMcpSessionUseCase.execute(sessionId, reason);
    } catch (error) {
      this.logger.error('Failed to close MCP session', error as Error, { sessionId });
      throw error;
    }
  }

  /**
   * Get session statistics and monitoring data
   */
  async getSessionStatistics(): Promise<any> {
    try {
      return await this.getSessionStatisticsUseCase.execute();
    } catch (error) {
      this.logger.error('Failed to get session statistics', error as Error);
      throw error;
    }
  }

  /**
   * Manually trigger session cleanup
   */
  async cleanupSessions(): Promise<{ cleanedCount: number }> {
    try {
      const cleanedCount = await this.cleanupIdleSessionsUseCase.execute();
      return { cleanedCount };
    } catch (error) {
      this.logger.error('Failed to cleanup sessions', error as Error);
      throw error;
    }
  }

  /**
   * Get MCP service health status
   */
  async getHealthStatus(): Promise<any> {
    try {
      this.logger.debug('Checking MCP service health');

      const [sessionStats] = await Promise.all([
        this.getSessionStatisticsUseCase.execute().catch(() => null)
      ]);

      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          sessionManager: sessionStats !== null ? 'operational' : 'degraded'
        },
        sessions: sessionStats || {
          total: 0,
          active: 0,
          idle: 0,
          closed: 0
        },
        cleanup: {
          enabled: this.cleanupInterval !== null,
          intervalMs: this.cleanupIntervalMs
        }
      };

      // Determine overall health
      if (sessionStats === null) {
        healthStatus.status = 'degraded';
      }

      this.logger.debug('MCP service health checked', {
        status: healthStatus.status,
        totalSessions: sessionStats?.total || 0
      });

      return healthStatus;
    } catch (error) {
      this.logger.error('Failed to check MCP service health', error as Error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: (error as Error).message
      };
    }
  }

  /**
   * Start periodic cleanup of idle sessions
   */
  private startPeriodicCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(async () => {
      try {
        await this.cleanupIdleSessionsUseCase.execute();
      } catch (error) {
        this.logger.error('Periodic session cleanup failed', error as Error);
      }
    }, this.cleanupIntervalMs);

    this.logger.info('Periodic session cleanup started', {
      intervalMs: this.cleanupIntervalMs
    });
  }

  /**
   * Stop periodic cleanup
   */
  public stopPeriodicCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.logger.info('Periodic session cleanup stopped');
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down MCP application service');

      // Stop periodic cleanup
      this.stopPeriodicCleanup();

      // Final cleanup
      await this.cleanupIdleSessionsUseCase.execute();

      this.logger.info('MCP application service shutdown completed');
    } catch (error) {
      this.logger.error('Error during MCP service shutdown', error as Error);
    }
  }
}
