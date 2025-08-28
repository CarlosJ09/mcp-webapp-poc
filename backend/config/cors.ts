import cors from "cors";

export const corsConfig = cors({
  origin: ["http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Accept",
    "Authorization",
    // MCP specific headers that are required by the SDK
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

export const devCorsConfig = cors({
  origin: true,
  methods: "*",
  allowedHeaders: "*",
  exposedHeaders: "*",
  credentials: true,
  optionsSuccessStatus: 200,
});
