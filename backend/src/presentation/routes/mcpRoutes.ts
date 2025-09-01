/**
 * MCP Routes
 * Presentation layer routing for MCP protocol endpoints
 */

import { Router } from 'express';
import { McpController } from '../controllers/McpController';
import { container } from '../../shared/container/Container';

/**
 * Create MCP routes
 */
export function createMcpRoutes(): Router {
  const router = Router();
  
  // Get MCP controller from dependency injection container
  const mcpController = container.get<McpController>('mcpController');

  /**
   * @route POST /mcp
   * @desc Handle MCP protocol communication (initialize and requests)
   * @access Public
   * @headers mcp-session-id - Session ID for existing sessions
   */
  router.post('/', (req, res) => mcpController.handleMcpPost(req, res));

  /**
   * @route GET /mcp
   * @desc Handle MCP GET requests (server-to-client notifications via SSE)
   * @access Public
   * @headers mcp-session-id - Required session ID
   */
  router.get('/', (req, res) => mcpController.handleMcpGet(req, res));

  /**
   * @route DELETE /mcp
   * @desc Terminate MCP session
   * @access Public
   * @headers mcp-session-id - Required session ID
   * @body reason - Optional reason for session termination
   */
  router.delete('/', (req, res) => mcpController.handleMcpDelete(req, res));

  /**
   * @route GET /mcp/stats
   * @desc Get MCP session statistics
   * @access Public
   */
  router.get('/stats', (req, res) => mcpController.getSessionStatistics(req, res));

  /**
   * @route POST /mcp/cleanup
   * @desc Manually trigger session cleanup
   * @access Public
   */
  router.post('/cleanup', (req, res) => mcpController.cleanupSessions(req, res));

  /**
   * @route GET /mcp/health
   * @desc Get MCP service health status
   * @access Public
   */
  router.get('/health', (req, res) => mcpController.getHealthStatus(req, res));

  return router;
}
