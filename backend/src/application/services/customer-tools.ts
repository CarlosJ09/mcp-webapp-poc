/**
 * @fileoverview Customer tools for MCP WebApp backend
 * Provides customer-specific query tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import mysql from 'mysql2/promise';
import { createLogger } from "../../shared/config/logger";
import { dbConfig } from "../../shared/config/database";

const logger = createLogger('Customer-Tools');

/**
 * Register customer-related tools with the MCP server
 * @param server - MCP server instance
 */
export function registerCustomerTools(server: McpServer): void {
  server.registerTool(
    "query-customers",
    {
      title: "Query Customers",
      description: "Execute SQL queries on the customers table",
      inputSchema: {
        limit: z.number().optional().describe("Number of records to return (default: 50)"),
        search: z.string().optional().describe("Search term for customer name or email"),
        sortBy: z.enum(["name", "email", "created_at"]).optional().describe("Field to sort by (default: created_at)"),
        sortOrder: z.enum(["ASC", "DESC"]).optional().describe("Sort order (default: DESC)"),
      },
    },
    async ({ limit = 50, search, sortBy = "created_at", sortOrder = "DESC" }) => {
      let connection;
      try {
        logger.debug('Executing customers query', { limit, search, sortBy, sortOrder });
        
        // Validate that we have database configuration
        if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
          throw new Error('Database configuration is incomplete. Please check your environment variables.');
        }

        // Create database connection
        connection = await mysql.createConnection(dbConfig);
        
        // Start with basic SELECT * query
        let query = `SELECT * FROM customers`;
        const conditions: string[] = [];
        
        // Add search filter if provided and not empty
        if (search && search.trim() !== '') {
          conditions.push(`(name LIKE '%${search}%' OR email LIKE '%${search}%')`);
        }
        
        // Add WHERE clause if we have conditions
        if (conditions.length > 0) {
          query += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        // Add ORDER BY if provided and not empty
        if (sortBy && sortBy.trim() !== '' && sortOrder && sortOrder.trim() !== '') {
          query += ` ORDER BY ${sortBy} ${sortOrder}`;
        }
        
        // Add LIMIT if provided and valid
        if (limit && limit > 0) {
          query += ` LIMIT ${limit}`;
        }
        
        // Execute the query without parameters array
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
        logger.error("Error executing customers query", error instanceof Error ? error : new Error('Unknown error'), { limit, search, sortBy, sortOrder });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ 
                error: "Failed to execute customers query", 
                message: error instanceof Error ? error.message : 'Unknown error',
                parameters: { limit, search, sortBy, sortOrder }
              }, null, 2),
            },
          ],
        };
      } finally {
        // Always close the connection
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
