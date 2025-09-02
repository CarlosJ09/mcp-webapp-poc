/**
 * @fileoverview CORS configuration for MCP WebApp backend
 * Handles cross-origin resource sharing policies and headers
 */

import cors from "cors";
import { config } from "./app";

/**
 * Production CORS configuration
 * Stricter security settings for production environment
 */
export const corsConfig = cors({
  origin: config.cors.allowed_origins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Accept",
    "Authorization",
    // MCP specific headers required by the SDK
    "mcp-protocol-version",
    "mcp-session-id", 
    "mcp-request-id",
    "mcp-message-type",
    // Additional headers that might be used by the MCP client
    "x-requested-with",
    "cache-control",
    "pragma",
  ],
  exposedHeaders: [
    "mcp-session-id",
    "mcp-protocol-version", 
    "mcp-request-id",
    "mcp-message-type",
  ],
  credentials: true,
  // Handle preflight requests properly
  preflightContinue: false,
  optionsSuccessStatus: 200,
});

/**
 * Development CORS configuration
 * More permissive settings for development environment
 */
export const devCorsConfig = cors({
  origin: true, // Allow all origins in development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Accept", 
    "Authorization",
    "mcp-protocol-version",
    "mcp-session-id",
    "mcp-request-id", 
    "mcp-message-type",
    "x-requested-with",
    "cache-control",
    "pragma",
  ],
  exposedHeaders: [
    "mcp-session-id",
    "mcp-protocol-version",
    "mcp-request-id",
    "mcp-message-type",
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200,
});
