import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDashboardTools(server: McpServer) {
  // Real-time data generation tool
  server.registerTool(
    "generate-realtime-data",
    {
      title: "Generate Realtime Data",
      description: "Generate random real-time metrics for dashboard",
      inputSchema: { 
        metric: z.enum(["sales", "users", "performance"]),
        count: z.number().optional().default(10)
      },
    },
    async ({ metric, count = 10 }) => {
      let data;
      
      switch (metric) {
        case "sales":
          data = Array.from({ length: count }, (_, i) => ({
            timestamp: new Date(Date.now() - (count - i) * 60000).toISOString(),
            value: Math.floor(Math.random() * 10000) + 5000
          }));
          break;
          
        case "users":
          data = Array.from({ length: count }, (_, i) => ({
            timestamp: new Date(Date.now() - (count - i) * 60000).toISOString(),
            active: Math.floor(Math.random() * 5000) + 2000,
            new: Math.floor(Math.random() * 100) + 50
          }));
          break;
          
        case "performance":
          data = Array.from({ length: count }, (_, i) => ({
            timestamp: new Date(Date.now() - (count - i) * 60000).toISOString(),
            cpu: Math.random() * 100,
            memory: Math.random() * 100,
            response: Math.random() * 1000 + 100
          }));
          break;
      }

      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    }
  );
}
