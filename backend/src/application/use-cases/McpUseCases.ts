/**
 * MCP Use Cases
 * Application layer business logic for MCP protocol operations
 */

import { McpSession, SessionStatus, SessionConfig } from '../../domain/entities/McpSession';
import { IMcpServer, IMcpTransport, ISessionManager } from '../../domain/interfaces/IMcpServices';
import { ILogger } from '../../shared/types/ILogger';

/**
 * Initialize MCP Session Use Case
 * Handles the creation and initialization of new MCP sessions
 */
export class InitializeMcpSessionUseCase {
  constructor(
    private readonly mcpServer: IMcpServer,
    private readonly mcpTransport: IMcpTransport,
    private readonly sessionManager: ISessionManager,
    private readonly logger: ILogger
  ) {}

  async execute(requestBody: any, sessionConfig?: SessionConfig): Promise<string> {
    try {
      this.logger.info('Initializing new MCP session');

      // Validate initialize request
      if (!this.isValidInitializeRequest(requestBody)) {
        throw new Error('Invalid initialize request format');
      }

      // Create transport
      const transport = this.mcpTransport.createTransport();
      
      // Create session with business rules applied
      const session = await this.sessionManager.createSession(transport, sessionConfig);
      
      // Initialize and connect MCP server
      await this.mcpServer.initialize({
        name: "dashboard-mcp-server",
        version: "1.0.0"
      });

      await this.mcpServer.connect(transport);

      // Activate the session
      session.activate();

      this.logger.info('MCP session initialized successfully', {
        sessionId: session.id,
        status: session.status
      });

      return session.id;
    } catch (error) {
      this.logger.error('Failed to initialize MCP session', error as Error);
      throw new Error('Unable to initialize MCP session');
    }
  }

  private isValidInitializeRequest(body: any): boolean {
    return body && 
           body.jsonrpc === "2.0" && 
           body.method === "initialize" &&
           body.params;
  }
}

/**
 * Handle MCP Request Use Case
 * Processes incoming MCP requests for existing sessions
 */
export class HandleMcpRequestUseCase {
  constructor(
    private readonly sessionManager: ISessionManager,
    private readonly logger: ILogger
  ) {}

  async execute(sessionId: string, req: any, res: any, body: any): Promise<void> {
    try {
      this.logger.info('Handling MCP request', { sessionId, method: body?.method });

      // Get session and validate
      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Check session status
      if (session.status !== SessionStatus.ACTIVE && session.status !== SessionStatus.IDLE) {
        throw new Error('Session is not in a valid state for requests');
      }

      // Update session activity (business rule)
      await this.sessionManager.updateSessionActivity(sessionId);

      // Handle request through transport
      await session.transport.handleRequest(req, res, body);

      this.logger.debug('MCP request handled successfully', { 
        sessionId, 
        method: body?.method,
        status: session.status
      });
    } catch (error) {
      this.logger.error('Failed to handle MCP request', error as Error, { sessionId });
      
      // Send error response
      if (!res.headersSent) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: (error as Error).message || "Bad Request",
          },
          id: body?.id || null,
        });
      }
    }
  }
}

/**
 * Close MCP Session Use Case
 * Handles proper session closure and cleanup
 */
export class CloseMcpSessionUseCase {
  constructor(
    private readonly sessionManager: ISessionManager,
    private readonly logger: ILogger
  ) {}

  async execute(sessionId: string, reason?: string): Promise<void> {
    try {
      this.logger.info('Closing MCP session', { sessionId, reason });

      // Get session
      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        this.logger.warn('Attempted to close non-existent session', { sessionId });
        return;
      }

      // Close session through session manager (applies business rules)
      await this.sessionManager.closeSession(sessionId, reason);

      this.logger.info('MCP session closed successfully', {
        sessionId,
        reason,
        duration: session.getDuration()
      });
    } catch (error) {
      this.logger.error('Failed to close MCP session', error as Error, { sessionId, reason });
      throw new Error('Unable to close MCP session');
    }
  }
}

/**
 * Cleanup Idle Sessions Use Case
 * Periodic cleanup of idle and expired sessions
 */
export class CleanupIdleSessionsUseCase {
  constructor(
    private readonly sessionManager: ISessionManager,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<number> {
    try {
      this.logger.debug('Starting idle session cleanup');

      const cleanedCount = await this.sessionManager.cleanupIdleSessions();

      if (cleanedCount > 0) {
        this.logger.info('Idle sessions cleaned up', { cleanedCount });
      } else {
        this.logger.debug('No idle sessions to cleanup');
      }

      return cleanedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup idle sessions', error as Error);
      return 0;
    }
  }
}

/**
 * Get Session Statistics Use Case
 * Provides session analytics and monitoring data
 */
export class GetSessionStatisticsUseCase {
  constructor(
    private readonly sessionManager: ISessionManager,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<any> {
    try {
      this.logger.debug('Getting session statistics');

      const stats = await this.sessionManager.getSessionStats();
      const activeSessions = await this.sessionManager.getActiveSessions();

      // Business rule: Calculate additional metrics
      const sessionMetrics = {
        ...stats,
        activeSessionDetails: activeSessions.map(session => ({
          id: session.id,
          status: session.status,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
          duration: session.getDuration(),
          isIdle: session.isIdle()
        })),
        performance: {
          averageSessionDuration: activeSessions.length > 0 
            ? activeSessions.reduce((sum, s) => sum + s.getDuration(), 0) / activeSessions.length 
            : 0,
          idleSessionsPercentage: stats.total > 0 ? (stats.idle / stats.total) * 100 : 0
        }
      };

      this.logger.debug('Session statistics calculated', { 
        total: stats.total,
        active: stats.active,
        idle: stats.idle
      });

      return sessionMetrics;
    } catch (error) {
      this.logger.error('Failed to get session statistics', error as Error);
      throw new Error('Unable to retrieve session statistics');
    }
  }
}
