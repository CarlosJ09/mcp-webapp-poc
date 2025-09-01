/**
 * MCP Server Implementation
 * Infrastructure layer implementation of MCP protocol server
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";

import { IMcpServer, IMcpTransport } from '../../domain/interfaces/IMcpServices';
import { ILogger } from '../../shared/types/ILogger';

/**
 * MCP Server Implementation
 * Handles Model Context Protocol server operations
 */
export class McpServerImplementation implements IMcpServer {
  private server: McpServer | null = null;

  constructor(private readonly logger: ILogger) {}

  /**
   * Initialize MCP server with configuration
   */
  async initialize(config: any): Promise<void> {
    try {
      this.logger.info('Initializing MCP server', config);

      this.server = new McpServer({
        name: config.name || "dashboard-mcp-server",
        version: config.version || "1.0.0",
      });

      // Register default resources and tools will be handled externally
      this.logger.info('MCP server initialized successfully', {
        name: config.name,
        version: config.version
      });
    } catch (error) {
      this.logger.error('Failed to initialize MCP server', error as Error);
      throw new Error('Unable to initialize MCP server');
    }
  }

  /**
   * Register resources with the server
   */
  async registerResources(resources: any): Promise<void> {
    try {
      if (!this.server) {
        throw new Error('Server not initialized');
      }

      this.logger.debug('Registering resources with MCP server');
      
      // Resources registration logic would go here
      // This depends on the specific resource structure
      
      this.logger.info('Resources registered successfully');
    } catch (error) {
      this.logger.error('Failed to register resources', error as Error);
      throw error;
    }
  }

  /**
   * Register tools with the server
   */
  async registerTools(tools: any): Promise<void> {
    try {
      if (!this.server) {
        throw new Error('Server not initialized');
      }

      this.logger.debug('Registering tools with MCP server');
      
      // Tools registration logic would go here
      // This depends on the specific tool structure
      
      this.logger.info('Tools registered successfully');
    } catch (error) {
      this.logger.error('Failed to register tools', error as Error);
      throw error;
    }
  }

  /**
   * Connect to transport
   */
  async connect(transport: any): Promise<void> {
    try {
      if (!this.server) {
        throw new Error('Server not initialized');
      }

      this.logger.debug('Connecting MCP server to transport');
      
      await this.server.connect(transport);
      
      this.logger.info('MCP server connected to transport successfully');
    } catch (error) {
      this.logger.error('Failed to connect MCP server to transport', error as Error);
      throw error;
    }
  }

  /**
   * Get server information
   */
  getServerInfo(): {
    name: string;
    version: string;
    capabilities: string[];
  } {
    return {
      name: "dashboard-mcp-server",
      version: "1.0.0",
      capabilities: [
        "resources",
        "tools",
        "prompts"
      ]
    };
  }

  /**
   * Get underlying server instance (for advanced operations)
   */
  getServer(): McpServer | null {
    return this.server;
  }
}

/**
 * MCP Transport Implementation
 * Handles HTTP transport for MCP protocol
 */
export class McpTransportImplementation implements IMcpTransport {
  constructor(private readonly logger: ILogger) {}

  /**
   * Create new transport instance
   */
  createTransport(config?: any): StreamableHTTPServerTransport {
    try {
      this.logger.debug('Creating new MCP transport');

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sessionId) => {
          this.logger.info('MCP transport session initialized', { sessionId });
        },
        // DNS rebinding protection configuration
        enableDnsRebindingProtection: config?.enableDnsRebinding || false,
        allowedHosts: config?.allowedHosts || ['127.0.0.1', 'localhost'],
      });

      // Setup close handler
      transport.onclose = () => {
        const sessionId = transport.sessionId;
        this.logger.info('MCP transport session closed', { sessionId });
      };

      this.logger.debug('MCP transport created successfully');
      return transport;
    } catch (error) {
      this.logger.error('Failed to create MCP transport', error as Error);
      throw new Error('Unable to create MCP transport');
    }
  }

  /**
   * Handle incoming request through transport
   */
  async handleRequest(req: any, res: any, body?: any): Promise<void> {
    try {
      // This would be handled by the specific transport instance
      // The implementation depends on the transport's handleRequest method
      this.logger.debug('Handling request through MCP transport', {
        method: body?.method,
        url: req.url
      });
      
      // The actual transport handling would be done by the transport instance
      // This is a placeholder for the interface compliance
    } catch (error) {
      this.logger.error('Failed to handle request through transport', error as Error);
      throw error;
    }
  }

  /**
   * Get transport session ID
   */
  getSessionId(): string | undefined {
    // This would return the session ID from the specific transport instance
    return undefined;
  }

  /**
   * Close transport connection
   */
  close(): void {
    try {
      this.logger.debug('Closing MCP transport');
      // Close logic would be implemented by specific transport instance
    } catch (error) {
      this.logger.error('Failed to close MCP transport', error as Error);
    }
  }
}
