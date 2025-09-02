/**
 * @fileoverview Analytics tools for MCP WebApp backend
 * Provides analytics and reporting query tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import mysql from 'mysql2/promise';
import { createLogger } from "../../shared/config/logger";
import { dbConfig } from "../../shared/config/database";

const logger = createLogger('Analytics-Tools');

/**
 * Register analytics-related tools with the MCP server
 * @param server - MCP server instance
 */
export function registerAnalyticsTools(server: McpServer): void {
  // Monthly sales analysis
  server.registerTool(
    "sales-monthly-analysis",
    {
      title: "Monthly Sales Analysis",
      description: "Get monthly sales analytics for the last 12 months",
      inputSchema: {
        months: z.number().optional().describe("Number of months to analyze (default: 12)"),
      },
    },
    async ({ months = 12 }) => {
      let connection;
      try {
        // Validate months parameter - handle null, undefined, empty, and negative values
        const validMonths = (months !== undefined && months !== null && months > 0) ? months : 12;
        
        logger.debug('Executing monthly sales analysis', { months: validMonths });
        
        if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
          throw new Error('Database configuration is incomplete. Please check your environment variables.');
        }

        connection = await mysql.createConnection(dbConfig);
        
        const query = `
          SELECT 
            DATE_FORMAT(s.date, '%Y-%m') as month,
            COUNT(s.id) as total_sales,
            SUM(s.total) as total_revenue,
            AVG(s.total) as avg_order_value,
            COUNT(DISTINCT s.customer_id) as unique_customers
          FROM sales s
          WHERE s.date >= DATE_SUB(CURRENT_DATE, INTERVAL ? MONTH)
          GROUP BY DATE_FORMAT(s.date, '%Y-%m')
          ORDER BY month DESC
        `;
        
        const [results] = await connection.execute(query, [validMonths]);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error executing monthly sales analysis", error instanceof Error ? error : new Error('Unknown error'), { months });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ 
                error: "Failed to execute monthly sales analysis", 
                message: error instanceof Error ? error.message : 'Unknown error',
                parameters: { months }
              }, null, 2),
            },
          ],
        };
      } finally {
        if (connection) {
          try {
            await connection.end();
          } catch (closeError) {
            logger.warn("Error closing database connection", closeError instanceof Error ? closeError : new Error('Unknown error'));
          }
        }
      }
    }
  );

  // Product performance analysis
  server.registerTool(
    "product-performance",
    {
      title: "Product Performance Analysis",
      description: "Get product performance analytics",
      inputSchema: {
        limit: z.number().optional().describe("Number of products to return (default: 50)"),
      },
    },
    async ({ limit = 50 }) => {
      let connection;
      try {
        // Validate limit parameter - handle null, undefined, empty, and negative values
        const validLimit = (limit !== undefined && limit !== null && limit > 0) ? limit : 50;
        
        logger.debug('Executing product performance analysis', { limit: validLimit });
        
        if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
          throw new Error('Database configuration is incomplete. Please check your environment variables.');
        }

        connection = await mysql.createConnection(dbConfig);
        
        const query = `
          SELECT 
            i.id,
            i.name,
            SUM(sd.quantity) as total_quantity_sold,
            SUM(sd.subtotal) as total_revenue,
            COUNT(DISTINCT sd.sale_id) as number_of_sales,
            AVG(sd.unit_price) as avg_selling_price,
            i.stock as current_stock
          FROM items i
          LEFT JOIN sale_details sd ON i.id = sd.item_id
          LEFT JOIN sales s ON sd.sale_id = s.id
          GROUP BY i.id, i.name, i.stock
          ORDER BY total_revenue DESC
          LIMIT ?
        `;
        
        const [results] = await connection.execute(query, [validLimit]);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error executing product performance analysis", error instanceof Error ? error : new Error('Unknown error'), { limit });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ 
                error: "Failed to execute product performance analysis", 
                message: error instanceof Error ? error.message : 'Unknown error',
                parameters: { limit }
              }, null, 2),
            },
          ],
        };
      } finally {
        if (connection) {
          try {
            await connection.end();
          } catch (closeError) {
            logger.warn("Error closing database connection", closeError instanceof Error ? closeError : new Error('Unknown error'));
          }
        }
      }
    }
  );
}
