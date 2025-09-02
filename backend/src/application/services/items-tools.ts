/**
 * @fileoverview Items tools for MCP WebApp backend
 * Provides items-specific query tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import mysql from 'mysql2/promise';
import { createLogger } from "../../shared/config/logger";
import { dbConfig } from "../../shared/config/database";

const logger = createLogger('Items-Tools');

/**
 * Register items-related tools with the MCP server
 * @param server - MCP server instance
 */
export function registerItemsTools(server: McpServer): void {
    // Tool to query items/inventory with various filters
  server.registerTool(
    "query-items",
    {
      title: "Query Items",
      description: "Execute SQL queries on the items/inventory table",
      inputSchema: {
        limit: z.number().optional().describe("Number of records to return (default: 50)"),
        search: z.string().optional().describe("Search term for item name"),
        inStock: z.boolean().optional().describe("Filter items that are in stock (stock > 0)"),
        minPrice: z.number().optional().describe("Minimum price filter"),
        maxPrice: z.number().optional().describe("Maximum price filter"),
        sortBy: z.enum(["name", "price", "stock", "created_at"]).optional().describe("Field to sort by (default: created_at)"),
        sortOrder: z.enum(["ASC", "DESC"]).optional().describe("Sort order (default: DESC)"),
      },
    },
    async ({ limit = 50, search, inStock, minPrice, maxPrice, sortBy = "created_at", sortOrder = "DESC" }) => {
      let connection;
      try {
        logger.debug('Executing items query', { limit, search, inStock, minPrice, maxPrice, sortBy, sortOrder });
        
        // Validate that we have database configuration
        if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
          throw new Error('Database configuration is incomplete. Please check your environment variables.');
        }

        // Create database connection
        connection = await mysql.createConnection(dbConfig);
        
        // Start with the same basic query that works
        let query = `SELECT * FROM items`;
        const conditions: string[] = [];
        
        // Add filters only if provided and not empty/null
        if (search && search.trim() !== '') {
          conditions.push(`name LIKE '%${search}%'`);
        }
        
        if (inStock !== undefined && inStock !== null) {
          if (inStock === true) {
            conditions.push('stock > 0');
          } else if (inStock === false) {
            conditions.push('stock = 0');
          }
        }
        
        if (minPrice !== undefined && minPrice !== null && minPrice >= 0) {
          conditions.push(`price >= ${minPrice}`);
        }
        
        if (maxPrice !== undefined && maxPrice !== null && maxPrice >= 0) {
          conditions.push(`price <= ${maxPrice}`);
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
        logger.error("Error executing items query", error instanceof Error ? error : new Error('Unknown error'), { limit, search, inStock, minPrice, maxPrice, sortBy, sortOrder });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ 
                error: "Failed to execute items query", 
                message: error instanceof Error ? error.message : 'Unknown error',
                parameters: { limit, search, inStock, minPrice, maxPrice, sortBy, sortOrder }
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