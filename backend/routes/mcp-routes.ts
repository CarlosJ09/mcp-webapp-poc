import express from "express";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { 
  createMCPServer, 
  createTransport, 
  getTransport, 
  getAvailableTransports 
} from "../services/mcp-server.ts";

const router = express.Router();

// Handle POST requests for client-to-server communication
router.post("/", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  console.log("Received request with session ID:", sessionId);
  console.log("Available transports:", getAvailableTransports());
  
  let transport = sessionId ? getTransport(sessionId) : undefined;

  if (transport) {
    // Reuse existing transport
    console.log("Reusing existing transport for session:", sessionId);
  } else if (!sessionId && isInitializeRequest(req.body)) {
    console.log("Creating new transport for initialize request");
    
    // Create new transport and server
    transport = createTransport();
    const server = createMCPServer();
    
    // Connect server to transport
    await server.connect(transport);
  } else {
    // Invalid request
    res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Bad Request: No valid session ID provided",
      },
      id: null,
    });
    return;
  }

  // Handle the request
  await transport.handleRequest(req, res, req.body);
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (
  req: express.Request,
  res: express.Response
) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  const transport = sessionId ? getTransport(sessionId) : undefined;
  
  if (!transport) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }

  await transport.handleRequest(req, res);
};

// Handle GET requests for server-to-client notifications via SSE
router.get("/", handleSessionRequest);

// Handle DELETE requests for session termination
router.delete("/", handleSessionRequest);

export default router;
