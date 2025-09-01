#!/usr/bin/env node
/**
 * @fileoverview MCP Server entry point for Stdio transport
 * This allows running the MCP server with stdio communication instead of HTTP
 * Uses the same SOLID architecture as the HTTP server
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerDashboardResources } from "../application/services/dashboard-resources.js";
import { registerDashboardTools } from "../application/services/dashboard-tools.js";
import { createLogger } from "../shared/config/logger.js";

const logger = createLogger('MCP-Stdio-Server');

async function startStdioServer() {
  logger.info('Starting MCP Server with Stdio transport...');
  
  try {
    // Create MCP server with same configuration as HTTP server
    const server = new McpServer({
      name: "dashboard-mcp-server",
      version: "1.0.0",
    });

    // Register all dashboard resources and tools using SOLID architecture
    logger.info('Registering dashboard resources and tools...');
    registerDashboardResources(server);
    registerDashboardTools(server);

    // Create stdio transport
    const transport = new StdioServerTransport();
    
    logger.info('Connecting server to stdio transport...');
    await server.connect(transport);
    
    logger.info('🚀 MCP Server with Stdio transport started successfully');
    logger.info('Server is ready to receive MCP requests via stdio');
    logger.info('Available tools: get-sales-metrics, get-customer-analytics, get-inventory-metrics');
    logger.info('Available resources: sales-data, customers-data, dashboard-metrics, items-data');

  } catch (error) {
    logger.error('Failed to start MCP server with stdio transport', error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down stdio server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down stdio server...');
  process.exit(0);
});

// Start the server
startStdioServer().catch((error) => {
  logger.error('Unhandled error starting stdio server', error instanceof Error ? error : new Error(String(error)));
  process.exit(1);
});