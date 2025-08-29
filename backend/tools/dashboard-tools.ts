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

  server.registerTool(
    "get-customers-metrics",
    {
      title: "Get Customers Metrics",
      description: "Get customers metrics for dashboard",
    },
    async () => {
      try {
        const customersData = await fetch(
          `${HOSTDATA_URL}/metrics/customer-analytics`
        );
        const customersDataJson = await customersData.json();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(customersDataJson, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Error fetching customers data:", error);
        return {
          content: [],
        };
      }
    }
  );

  server.registerTool(
    "get-inventory-metrics",
    {
      title: "Get Inventory Metrics",
      description: "Get inventory metrics for dashboard",
    },
    async () => {
      try {
        const inventoryData = await fetch(
          `${HOSTDATA_URL}/metrics/inventory-status`
        );
        const inventoryDataJson = await inventoryData.json();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(inventoryDataJson, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Error fetching inventory data:", error);
        return {
          content: [],
        };
      }
    }
  );
}
