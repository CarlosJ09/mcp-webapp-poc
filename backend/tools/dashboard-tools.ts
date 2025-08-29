/**
 * @fileoverview Dashboard tools for MCP WebApp backend
 * Provides interactive tools for dashboard functionality
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createLogger } from "../config/logger";
import { externalApiService } from "../services/external/api-service";

const logger = createLogger('Dashboard-Tools');

/**
 * Register all dashboard-related tools with the MCP server
 * @param server - MCP server instance
 */
export function registerDashboardTools(server: McpServer): void {
  server.registerTool(
    "get-sales-metrics",
    {
      title: "Get Sales Metrics",
      description: "Get sales metrics by period for dashboard",
      inputSchema: {
        period: z.enum(["monthly", "weekly", "daily"]),
      },
    },
    async ({ period = "monthly" }) => {
      try {
        logger.debug('Fetching sales metrics', { period });
        const salesResponse = await externalApiService.getSalesSummary(period);
        
        if (!salesResponse.success) {
          throw new Error(salesResponse.error || 'Failed to fetch sales metrics');
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(salesResponse.data, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error fetching sales metrics", error instanceof Error ? error : new Error('Unknown error'), { period });
        return {
          content: [
            {
              type: "text", 
              text: JSON.stringify({ error: "Failed to fetch sales metrics", message: error instanceof Error ? error.message : 'Unknown error' }, null, 2),
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    "get-customers-metrics",
    {
      title: "Get Customers Metrics",
      description: "Get customers metrics for dashboard",
    },
    async () => {
      try {
        logger.debug('Fetching customer analytics');
        const analyticsResponse = await externalApiService.getCustomerAnalytics();
        
        if (!analyticsResponse.success) {
          throw new Error(analyticsResponse.error || 'Failed to fetch customer analytics');
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(analyticsResponse.data, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error fetching customer analytics", error instanceof Error ? error : new Error('Unknown error'));
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to fetch customer analytics", message: error instanceof Error ? error.message : 'Unknown error' }, null, 2),
            },
          ],
        };
      }
    }
  );

  server.registerTool(
    "get-inventory-metrics",
    {
      title: "Get Inventory Metrics",
      description: "Get inventory metrics for dashboard",
    },
    async () => {
      try {
        logger.debug('Fetching inventory metrics');
        const inventoryResponse = await externalApiService.getInventoryStatus();
        
        if (!inventoryResponse.success) {
          throw new Error(inventoryResponse.error || 'Failed to fetch inventory metrics');
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(inventoryResponse.data, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error fetching inventory metrics", error instanceof Error ? error : new Error('Unknown error'));
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "Failed to fetch inventory metrics", message: error instanceof Error ? error.message : 'Unknown error' }, null, 2),
            },
          ],
        };
      }
    }
  );
}
