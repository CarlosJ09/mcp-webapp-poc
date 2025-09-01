/**
 * MCP Service Interfaces
 * Define contracts for MCP protocol services following Interface Segregation Principle
 */

import { McpSession, SessionStatus, SessionConfig } from '../entities/McpSession';

/**
 * MCP Server Interface
 * Defines contract for MCP server operations
 */
export interface IMcpServer {
  /**
   * Initialize MCP server
   */
  initialize(config: any): Promise<void>;

  /**
   * Register resources with the server
   */
  registerResources(resources: any): Promise<void>;

  /**
   * Register tools with the server
   */
  registerTools(tools: any): Promise<void>;

  /**
   * Connect to transport
   */
  connect(transport: any): Promise<void>;

  /**
   * Get server information
   */
  getServerInfo(): {
    name: string;
    version: string;
    capabilities: string[];
  };
}

/**
 * MCP Transport Interface
 * Defines contract for transport layer operations
 */
export interface IMcpTransport {
  /**
   * Create new transport instance
   */
  createTransport(config?: any): any;

  /**
   * Handle incoming request
   */
  handleRequest(req: any, res: any, body?: any): Promise<void>;

  /**
   * Get transport session ID
   */
  getSessionId(): string | undefined;

  /**
   * Close transport connection
   */
  close(): void;
}

/**
 * Session Manager Interface
 * Defines contract for session management operations
 */
export interface ISessionManager {
  /**
   * Create new session
   */
  createSession(transport: any, config?: SessionConfig): Promise<McpSession>;

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Promise<McpSession | null>;

  /**
   * Get all active sessions
   */
  getActiveSessions(): Promise<McpSession[]>;

  /**
   * Update session activity
   */
  updateSessionActivity(sessionId: string): Promise<void>;

  /**
   * Close session
   */
  closeSession(sessionId: string, reason?: string): Promise<void>;

  /**
   * Cleanup idle sessions
   */
  cleanupIdleSessions(): Promise<number>;

  /**
   * Get session statistics
   */
  getSessionStats(): Promise<{
    total: number;
    active: number;
    idle: number;
    closed: number;
  }>;
}
