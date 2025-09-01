import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerDashboardResources } from "../../application/services/dashboard-resources";
import { registerDashboardTools } from "../../application/services/dashboard-tools";
import { createLogger } from "../../shared/config/logger";

const logger = createLogger('MCP-Server-Service');

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

export function createMCPServer(): McpServer {
  const server = new McpServer({
    name: "example-server",
    version: "1.0.0",
  });

  // Register all dashboard resources and tools
  registerDashboardResources(server);
  registerDashboardTools(server);

  return server;
}

export function createTransport(): StreamableHTTPServerTransport {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId) => {
      // Store the transport by session ID when session is initialized
      logger.info("Session initialized", { sessionId });
      transports[sessionId] = transport;
    },
    // DNS rebinding protection is disabled by default for backwards compatibility
    // enableDnsRebindingProtection: true,
    // allowedHosts: ['127.0.0.1'],
  });

  transport.onclose = () => {
    if (transport.sessionId) {
      logger.info("Session closed", { sessionId: transport.sessionId });
      delete transports[transport.sessionId];
    }
  };

  return transport;
}

export function getTransport(sessionId: string): StreamableHTTPServerTransport | undefined {
  return transports[sessionId];
}

export function getAvailableTransports(): string[] {
  return Object.keys(transports);
}
