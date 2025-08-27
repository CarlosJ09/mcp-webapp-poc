import cors from "cors";

export const corsConfig = cors({
  origin: [
    "http://localhost:3001",
  ],
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Accept",
    "mcp-session-id",
    "Authorization",
  ],
  exposedHeaders: ["mcp-session-id"], 
  credentials: true,
});
