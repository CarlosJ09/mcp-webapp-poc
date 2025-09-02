/**
 * @fileoverview SQL tools for MCP WebApp backend
 * Provides generic SQL query capabilities
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import mysql from 'mysql2/promise';
import { createLogger } from "../../shared/config/logger";
import { dbConfig } from "../../shared/config/database";

const logger = createLogger('SQL-Tools');

/**
 * Register SQL-related tools with the MCP server
 * @param server - MCP server instance
 */
export function registerSQLTools(server: McpServer): void {
  server.registerTool(
    "sql.query",
    {
      title: "SQL Query",
      description: "Execute SQL queries against Aurora MySQL database",
      inputSchema: {
        query: z.string().describe("The SQL query to execute (SELECT, INSERT, UPDATE, DELETE)"),
      },
    },
    async ({ query }) => {
      let connection;
      try {
        logger.debug('Executing SQL query', { query: query.substring(0, 100) + '...' });
        
        // Validate that we have database configuration
        if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
          throw new Error('Database configuration is incomplete. Please check your environment variables.');
        }

        // Create database connection
        connection = await mysql.createConnection(dbConfig);
        
        // Execute the query
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
        logger.error("Error executing SQL query", error instanceof Error ? error : new Error('Unknown error'), { query: query.substring(0, 100) });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ 
                error: "Failed to execute SQL query", 
                message: error instanceof Error ? error.message : 'Unknown error',
                query: query.substring(0, 100) + '...'
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

  // Add a table schema inspection tool
  server.registerTool(
    "sql.describe-table",
    {
      title: "Describe Table Schema",
      description: "Get the schema/structure of a database table",
      inputSchema: {
        table: z.string().describe("Table name to describe"),
      },
    },
    async ({ table }) => {
      let connection;
      try {
        logger.debug('Describing table schema', { table });
        
        // Validate that we have database configuration
        if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
          throw new Error('Database configuration is incomplete. Please check your environment variables.');
        }

        // Create database connection
        connection = await mysql.createConnection(dbConfig);
        
        // Execute DESCRIBE query
        const [results] = await connection.execute(`DESCRIBE ${table}`);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error("Error describing table", error instanceof Error ? error : new Error('Unknown error'), { table });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ 
                error: "Failed to describe table", 
                message: error instanceof Error ? error.message : 'Unknown error',
                table: table
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
