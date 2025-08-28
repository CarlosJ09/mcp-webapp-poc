import express from "express";
import { corsConfig, devCorsConfig } from "./config/cors.ts";
import mcpRoutes from "./routes/mcp-routes.ts";

const app = express();
const PORT = 3000;

app.use(corsConfig);


app.use(express.json());
app.use(process.env.NODE_ENV === 'development' ? devCorsConfig : corsConfig);

// MCP routes
app.use("/mcp", mcpRoutes);

app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on http://localhost:${PORT}`);
});
