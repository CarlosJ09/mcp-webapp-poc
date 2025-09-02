/**
 * @fileoverview Customer and Inventory analytics tools for MCP WebApp backend
 * Provides customer ret    async ({ limit = 50, months = 3 }) => {
      let connection;
      try {
        // Validate parameters - handle null, undefined, empty, and negative values
        const validLimit = (limit !== undefined && limit !== null && limit > 0) ? limit : 50;
        const validMonths = (months !== undefined && months !== null && months > 0) ? months : 3;
        
        logger.debug('Executing inventory turnover analysis', { limit: validLimit, months: validMonths });on and inventory turnover analytics
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import mysql from 'mysql2/promise';
import { createLogger } from "../../shared/config/logger";
import { dbConfig } from "../../shared/config/database";

const logger = createLogger('Retention-Tools');

/**
 * Register customer retention and inventory analytics tools with the MCP server
 * @param server - MCP server instance
 */
export function registerRetentionTools(server: McpServer): void {
  // Customer retention analysis
  server.registerTool(
    "customer-retention",
    {
      title: "Customer Retention Analysis",
      description: "Get customer retention and lifetime value analytics",
      inputSchema: {
        limit: z.number().optional().describe("Number of customers to return (default: 50)"),
      },
    },
    async ({ limit = 50 }) => {
      let connection;
      try {
        // Validate limit parameter - handle null, undefined, empty, and negative values
        const validLimit = (limit !== undefined && limit !== null && limit > 0) ? limit : 50;
        
        logger.debug('Executing customer retention analysis', { limit: validLimit });
        
        if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
          throw new Error('Database configuration is incomplete. Please check your environment variables.');
        }

        connection = await mysql.createConnection(dbConfig);
        
        const query = `
          SELECT 
            c.id,
            c.name,
            c.email,
            COUNT(s.id) as total_orders,
            SUM(s.total) as lifetime_value,
            MIN(s.date) as first_order_date,
            MAX(s.date) as last_order_date,
            DATEDIFF(MAX(s.date), MIN(s.date)) as customer_lifespan_days
          FROM customers c
          LEFT JOIN sales s ON c.id = s.customer_id
          GROUP BY c.id, c.name, c.email
          HAVING COUNT(s.id) > 0
          ORDER BY lifetime_value DESC
          LIMIT ${validLimit}
        `;
        
        const [results] = await connection.execute(query);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error executing customer retention analysis", error instanceof Error ? error : new Error('Unknown error'), { limit });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ 
                error: "Failed to execute customer retention analysis", 
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

  // Inventory turnover analysis
  server.registerTool(
    "inventory-turnover",
    {
      title: "Inventory Turnover Analysis",
      description: "Get inventory turnover analytics for the last 3 months",
      inputSchema: {
        limit: z.number().optional().describe("Number of items to return (default: 50)"),
        months: z.number().optional().describe("Number of months to analyze (default: 3)"),
      },
    },
    async ({ limit = 50, months = 3 }) => {
      // Validate parameters - handle null, undefined, empty, and negative values
      const validLimit = (limit !== undefined && limit !== null && limit > 0) ? limit : 50;
      const validMonths = (months !== undefined && months !== null && months > 0) ? months : 3;
      
      let connection;
      try {
        logger.debug('Executing inventory turnover analysis', { limit: validLimit, months: validMonths });
        
        if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
          throw new Error('Database configuration is incomplete. Please check your environment variables.');
        }

        connection = await mysql.createConnection(dbConfig);
        
        const query = `
          SELECT 
            i.id,
            i.name,
            i.stock as current_stock,
            COALESCE(SUM(sd.quantity), 0) as total_sold,
            CASE 
              WHEN i.stock > 0 THEN COALESCE(SUM(sd.quantity), 0) / i.stock
              ELSE 0 
            END as turnover_ratio,
            i.price * i.stock as inventory_value
          FROM items i
          LEFT JOIN sale_details sd ON i.id = sd.item_id
          LEFT JOIN sales s ON sd.sale_id = s.id 
            AND s.date >= DATE_SUB(CURRENT_DATE, INTERVAL ${validMonths} MONTH)
          GROUP BY i.id, i.name, i.stock, i.price
          ORDER BY turnover_ratio DESC
          LIMIT ${validLimit}
        `;
        
        const [results] = await connection.execute(query);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error executing inventory turnover analysis", error instanceof Error ? error : new Error('Unknown error'), { limit: validLimit, months: validMonths });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ 
                error: "Failed to execute inventory turnover analysis", 
                message: error instanceof Error ? error.message : 'Unknown error',
                parameters: { limit: validLimit, months: validMonths }
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
