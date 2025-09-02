import express from "express";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { 
  createMCPServer, 
  createTransport, 
  getTransport, 
  getAvailableTransports 
} from "../services/mcp-server";
import { createLogger } from "../config/logger";

const router = express.Router();
const logger = createLogger('MCP-Routes');

// Handle POST requests for client-to-server communication
router.post("/", async (req, res) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    logger.info("Received MCP request", { 
      sessionId, 
      availableTransports: getAvailableTransports(),
      method: req.body?.method 
    });
    
    let transport: StreamableHTTPServerTransport | undefined = sessionId ? getTransport(sessionId) : undefined;

    if (transport) {
      logger.info("Reusing existing transport", { sessionId });
    } else if (sessionId) {
      // Session ID provided but transport doesn't exist (possibly cleaned up)
      logger.info("Creating new transport for existing session", { sessionId });
      transport = createTransport('http') as StreamableHTTPServerTransport;
      const server = createMCPServer();
      
      // Connect server to transport
      await server.connect(transport);
    } else if (isInitializeRequest(req.body)) {
      logger.info("Creating new transport for initialize request");
      
      transport = createTransport('http') as StreamableHTTPServerTransport;
      const server = createMCPServer();
      
      // Connect server to transport
      await server.connect(transport);
    } else {
      logger.warn("Bad request: No valid session ID or initialize request", { sessionId });
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided and not an initialize request",
        },
        id: null,
      });
      return;
    }

    if (!transport) {
      throw new Error('Transport could not be created');
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    logger.error("Error handling MCP request", error instanceof Error ? error : new Error(String(error)));
    res.status(500).json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: `Internal error: ${error instanceof Error ? error.message : String(error)}`,
      },
      id: null,
    });
  }
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (
  req: express.Request,
  res: express.Response
) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  logger.info(`${req.method} request`, { 
    sessionId, 
    availableTransports: getAvailableTransports() 
  });
  
  const transport = sessionId ? getTransport(sessionId) : undefined;
  
  if (!transport) {
    logger.warn("Transport not found", { 
      sessionId, 
      availableTransports: getAvailableTransports() 
    });
    res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: `Invalid or missing session ID: ${sessionId}. Available sessions: ${getAvailableTransports().join(', ')}`,
      },
      id: null,
    });
    return;
  }

  logger.info(`Using existing transport for ${req.method} request`, { sessionId });
  await transport.handleRequest(req, res);
};

// Handle GET requests for server-to-client notifications via SSE
router.get("/", handleSessionRequest);

// Handle DELETE requests for session termination
router.delete("/", handleSessionRequest);

export default router;
