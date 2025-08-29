import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const HOSTDATA_URL = "http://13.220.233.0";

export function registerDashboardTools(server: McpServer) {
  server.registerTool(
    "get-sales-metrics",
    {
      title: "Get Sales Metrics",
      description: "Get sales metrics by period for dashboard",
      inputSchema: {
        period: z.enum(["monthly", "weekly", "daily"]),
      },
    },
    async ({ period = "monthly" }) => {
      try {
        const salesData = await fetch(
          `${HOSTDATA_URL}/metrics/sales-summary?period=${period}`
        );
        const salesDataJson = await salesData.json();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(salesDataJson, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Error fetching sales data:", error);
        return {
          content: [],
        };
      }
    }
  );
}
