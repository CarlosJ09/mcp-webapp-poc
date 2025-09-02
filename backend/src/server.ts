#!/usr/bin/env node
/**
 * @fileoverview MCP Server entry point for Stdio transport
 * This allows running the MCP server with stdio communication instead of HTTP
 * Uses the same SOLID architecture as the HTTP server
 * Note: Logging is disabled for stdio to prevent interference with MCP protocol
 */

// Load environment variables silently
import * as dotenv from 'dotenv';
dotenv.config({ debug: false });

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerDashboardResources } from "./resources/dashboard-resources.js";
import { registerDashboardTools } from "./tools/dashboard-tools.js";

async function startStdioServer() {
  try {
    // Create MCP server with same configuration as HTTP server
    const server = new McpServer({
      name: "dashboard-mcp-server",
      version: "1.0.0",
    });

    // Register all dashboard resources and tools using SOLID architecture
    registerDashboardResources(server);
    registerDashboardTools(server);

    // Create stdio transport
    const transport = new StdioServerTransport();
    
    await server.connect(transport);

  } catch (error) {
    console.error('Failed to start MCP server with stdio transport:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

// Start the server
startStdioServer().catch((error) => {
  console.error('Unhandled error starting stdio server', error);
  process.exit(1);
});
