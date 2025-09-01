/**
 * MCP Controller
 * Presentation layer controller for MCP protocol operations
 * Handles HTTP requests for MCP communication
 */

import { Request, Response } from 'express';
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { McpApplicationService } from '../../application/services/McpApplicationService';
import { ILogger } from '../../shared/types/ILogger';

/**
 * MCP Controller
 * Handles HTTP requests for MCP protocol communication
 */
export class McpController {
  constructor(
    private readonly mcpService: McpApplicationService,
    private readonly logger: ILogger
  ) {}

  /**
   * Handle MCP POST requests (initialize and other operations)
   * POST /mcp
   */
  async handleMcpPost(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      const requestBody = req.body;

      this.logger.info('MCP POST request received', {
        sessionId,
        method: requestBody?.method,
        hasSessionId: !!sessionId,
        isInitialize: isInitializeRequest(requestBody),
        ip: req.ip
      });

      // Handle initialize request (new session)
      if (!sessionId && isInitializeRequest(requestBody)) {
        await this.handleInitializeRequest(req, res, requestBody);
        return;
      }

      // Handle existing session request
      if (sessionId) {
        await this.handleExistingSessionRequest(req, res, sessionId, requestBody);
        return;
      }

      // Invalid request - no session ID and not initialize
      this.logger.warn('Invalid MCP request - no session ID and not initialize', {
        method: requestBody?.method,
        ip: req.ip
      });

      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided or invalid initialize request",
        },
        id: requestBody?.id || null,
      });

    } catch (error) {
      this.logger.error('Failed to handle MCP POST request', error as Error, {
        sessionId: req.headers["mcp-session-id"],
        method: req.body?.method,
        ip: req.ip
      });

      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal error",
          },
          id: req.body?.id || null,
        });
      }
    }
  }

  /**
   * Handle MCP GET requests (server-to-client notifications via SSE)
   * GET /mcp
   */
  async handleMcpGet(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;

      this.logger.info('MCP GET request received', {
        sessionId,
        ip: req.ip
      });

      if (!sessionId) {
        res.status(400).json({
          error: "Missing session ID",
          code: "MISSING_SESSION_ID",
          timestamp: new Date().toISOString()
        });
        return;
      }

      await this.mcpService.handleRequest(sessionId, req, res, undefined);

    } catch (error) {
      this.logger.error('Failed to handle MCP GET request', error as Error, {
        sessionId: req.headers["mcp-session-id"],
        ip: req.ip
      });

      if (!res.headersSent) {
        res.status(400).json({
          error: "Invalid or missing session ID",
          code: "INVALID_SESSION_ID",
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Handle MCP DELETE requests (session termination)
   * DELETE /mcp
   */
  async handleMcpDelete(req: Request, res: Response): Promise<void> {
    try {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      const { reason } = req.body || {};

      this.logger.info('MCP DELETE request received', {
        sessionId,
        reason,
        ip: req.ip
      });

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: "Missing session ID",
          code: "MISSING_SESSION_ID",
          timestamp: new Date().toISOString()
        });
        return;
      }

      await this.mcpService.closeSession(sessionId, reason);

      this.logger.info('MCP session closed successfully', {
        sessionId,
        reason
      });

      res.status(200).json({
        success: true,
        message: "Session closed successfully",
        sessionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Failed to handle MCP DELETE request', error as Error, {
        sessionId: req.headers["mcp-session-id"],
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: "Failed to close session",
        code: "SESSION_CLOSE_ERROR",
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get MCP session statistics
   * GET /mcp/stats
   */
  async getSessionStatistics(req: Request, res: Response): Promise<void> {
    try {
      this.logger.debug('MCP session statistics request received', {
        ip: req.ip
      });

      const statistics = await this.mcpService.getSessionStatistics();

      res.status(200).json({
        success: true,
        data: statistics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Failed to get MCP session statistics', error as Error, {
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: "Unable to retrieve session statistics",
        code: "SESSION_STATS_ERROR",
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Manually trigger session cleanup
   * POST /mcp/cleanup
   */
  async cleanupSessions(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('Manual session cleanup request received', {
        ip: req.ip
      });

      const result = await this.mcpService.cleanupSessions();

      this.logger.info('Manual session cleanup completed', {
        cleanedCount: result.cleanedCount
      });

      res.status(200).json({
        success: true,
        data: result,
        message: `Cleaned up ${result.cleanedCount} idle sessions`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Failed to cleanup sessions', error as Error, {
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: "Failed to cleanup sessions",
        code: "SESSION_CLEANUP_ERROR",
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get MCP service health status
   * GET /mcp/health
   */
  async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      this.logger.debug('MCP service health status request received', {
        ip: req.ip
      });

      const healthStatus = await this.mcpService.getHealthStatus();

      const statusCode = healthStatus.status === 'healthy' ? 200 :
                        healthStatus.status === 'degraded' ? 206 : 503;

      res.status(statusCode).json({
        success: healthStatus.status !== 'unhealthy',
        data: healthStatus,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error('Failed to get MCP service health status', error as Error, {
        ip: req.ip
      });

      res.status(503).json({
        success: false,
        error: "Unable to retrieve MCP service health status",
        code: "MCP_HEALTH_ERROR",
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle initialize request (private method)
   */
  private async handleInitializeRequest(req: Request, res: Response, requestBody: any): Promise<void> {
    try {
      this.logger.info('Handling MCP initialize request', {
        protocolVersion: requestBody.params?.protocolVersion,
        clientInfo: requestBody.params?.clientInfo
      });

      const result = await this.mcpService.initializeSession(requestBody);

      // Set session ID in response header for client to use in subsequent requests
      res.setHeader('MCP-Session-ID', result.sessionId);

      this.logger.info('MCP session initialized successfully', {
        sessionId: result.sessionId
      });

      // The actual MCP response will be handled by the transport layer
      await this.mcpService.handleRequest(result.sessionId, req, res, requestBody);

    } catch (error) {
      this.logger.error('Failed to initialize MCP session', error as Error);
      throw error;
    }
  }

  /**
   * Handle existing session request (private method)
   */
  private async handleExistingSessionRequest(
    req: Request, 
    res: Response, 
    sessionId: string, 
    requestBody: any
  ): Promise<void> {
    try {
      this.logger.debug('Handling request for existing MCP session', {
        sessionId,
        method: requestBody?.method
      });

      await this.mcpService.handleRequest(sessionId, req, res, requestBody);

    } catch (error) {
      this.logger.error('Failed to handle existing session request', error as Error, {
        sessionId,
        method: requestBody?.method
      });
      throw error;
    }
  }
}
