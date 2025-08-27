import express from "express";
import { corsConfig } from "./config/cors.ts";
import mcpRoutes from "./routes/mcp-routes.ts";

const app = express();
const PORT = 3000;

// Apply CORS configuration
app.use(corsConfig);

// Parse JSON bodies
app.use(express.json());

// MCP routes
app.use("/mcp", mcpRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on http://localhost:${PORT}`);
});
