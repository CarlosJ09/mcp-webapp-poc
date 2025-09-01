/**
 * @fileoverview Dash      try {
        logger.debug('Fetching sales data');
        const salesResponse = await externalApiService.getSalesData();
        
        if (!salesResponse.success) {
          throw new Error(salesResponse.error || 'Failed to fetch sales data');
        }
        
        logger.debug('Sales data fetched successfully', { 
          recordCount: Array.isArray(salesResponse.data) ? salesResponse.data.length : 'unknown' 
        });

        return {
          contents: [
            {
              uri: "sales://monthly",
              mimeType: "application/json",
              text: JSON.stringify(salesResponse.data, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error fetching sales data", error instanceof Error ? error : new Error('Unknown error'));
        return {
          contents: [
            {
              uri: "sales://monthly",
              mimeType: "application/json",
              text: JSON.stringify({ error: "Failed to fetch sales data", message: error instanceof Error ? error.message : 'Unknown error' }, null, 2),
            },
          ],
        };
      } MCP WebApp backend
 * Provides data resources for dashboard charts and analytics
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger } from "../../shared/config/logger";
import { externalApiService } from "../../infrastructure/external/api-service";

const logger = createLogger('Dashboard-Resources');

/**
 * Register all dashboard-related resources with the MCP server
 * @param server - MCP server instance
 */
export function registerDashboardResources(server: McpServer): void {
  // Sales data resource
  // General sales data resource
  server.registerResource(
    "sales-data",
    "sales://all",
    {
      title: "General Sales Data",
      description: "Sales data for dashboard charts",
    },
    async () => {
      try {
        logger.debug('Fetching general sales data');
        const salesResponse = await externalApiService.getSalesData();
        
        if (!salesResponse.success) {
          throw new Error(salesResponse.error || 'Failed to fetch sales data');
        }

        return {
          contents: [
            {
              uri: "sales://all",
              mimeType: "application/json",
              text: JSON.stringify(salesResponse.data, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error fetching general sales data", error instanceof Error ? error : new Error('Unknown error'));
        return {
          contents: [
            {
              uri: "sales://all", 
              mimeType: "application/json",
              text: JSON.stringify({ error: "Failed to fetch sales data", message: error instanceof Error ? error.message : 'Unknown error' }, null, 2),
            },
          ],
        };
      }
    }
  );

  // User analytics resource
  server.registerResource(
    "customers-data",
    "customers://all",
    {
      title: "Customers Data",
      description: "Customers data for dashboard charts",
    },
    async () => {
      try {
        logger.debug('Fetching customers data');
        const customersResponse = await externalApiService.getCustomersData();
        
        if (!customersResponse.success) {
          throw new Error(customersResponse.error || 'Failed to fetch customers data');
        }

        return {
          contents: [
            {
              uri: "customers://all",
              mimeType: "application/json",
              text: JSON.stringify(customersResponse.data, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error fetching customers data", error instanceof Error ? error : new Error('Unknown error'));
        return {
          contents: [
            {
              uri: "customers://all",
              mimeType: "application/json", 
              text: JSON.stringify({ error: "Failed to fetch customers data", message: error instanceof Error ? error.message : 'Unknown error' }, null, 2),
            },
          ],
        };
      }
    }
  );

  // Metrics resource
  server.registerResource(
    "dashboard-metrics",
    "metrics://dashboard",
    {
      title: "Dashboard Metrics",
      description: "Dashboard metrics for dashboard charts",
    },
    async () => {
      try {
        logger.debug('Fetching dashboard metrics');
        const metricsResponse = await externalApiService.getDashboardMetrics();
        
        if (!metricsResponse.success) {
          throw new Error(metricsResponse.error || 'Failed to fetch dashboard metrics');
        }

        return {
          contents: [
            {
              uri: "metrics://dashboard",
              mimeType: "application/json",
              text: JSON.stringify(metricsResponse.data, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error fetching dashboard metrics", error instanceof Error ? error : new Error('Unknown error'));
        return {
          contents: [
            {
              uri: "metrics://dashboard",
              mimeType: "application/json",
              text: JSON.stringify({ error: "Failed to fetch dashboard metrics", message: error instanceof Error ? error.message : 'Unknown error' }, null, 2),
            },
          ],
        };
      }
    }
  );

  // Revenue breakdown resource
  server.registerResource(
    "items-data",
    "items://all",
    {
      title: "Items Data",
      description: "Items data for dashboard charts",
    },
    async () => {
      try {
        logger.debug('Fetching items data');
        const itemsResponse = await externalApiService.getItemsData();
        
        if (!itemsResponse.success) {
          throw new Error(itemsResponse.error || 'Failed to fetch items data');
        }

        return {
          contents: [
            {
              uri: "items://all",
              mimeType: "application/json",
              text: JSON.stringify(itemsResponse.data, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error fetching items data", error instanceof Error ? error : new Error('Unknown error'));
        return {
          contents: [
            {
              uri: "items://all",
              mimeType: "application/json",
              text: JSON.stringify({ error: "Failed to fetch items data", message: error instanceof Error ? error.message : 'Unknown error' }, null, 2),
            },
          ],
        };
      }
    }
  );
}
