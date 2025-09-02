/**
 * @fileoverview Database configuration for MySQL connections
 * Shared configuration to avoid duplication across tools
 */

// Database connection configuration
export const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: Number(process.env.DB_TIMEOUT) || 60000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
};
