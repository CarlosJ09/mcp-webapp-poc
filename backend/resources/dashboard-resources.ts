import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const HOSTDATA_URL = "http://13.220.233.0";

export function registerDashboardResources(server: McpServer) {
  // Sales data resource
  server.registerResource(
    "sales-data",
    "sales://all",
    {
      title: "General Sales Data",
      description: "Sales data for dashboard charts",
    },
    async () => {
      try {
        const salesData = await fetch(`${HOSTDATA_URL}/sales`);
        const salesDataJson = await salesData.json();

        return {
          contents: [
            {
              uri: "sales://all",
              mimeType: "application/json",
              text: JSON.stringify(salesDataJson, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Error fetching sales data:", error);
        return {
          contents: [],
        };
      }
    }
  );

  // User analytics resource
  server.registerResource(
    "customers-data",
    "customers://all",
    {
      title: "Customers Data",
      description: "Customers data for dashboard charts",
    },
    async () => {
      try {
        const customersData = await fetch(`${HOSTDATA_URL}/customers`);
        const customersDataJson = await customersData.json();

        return {
          contents: [
            {
              uri: "customers://all",
              mimeType: "application/json",
              text: JSON.stringify(customersDataJson, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Error fetching customers data:", error);
        return {
          contents: [],
        };
      }
    }
  );

  // Metrics resource
  server.registerResource(
    "dashboard-metrics",
    "metrics://dashboard",
    {
      title: "Dashboard Metrics",
      description: "Dashboard metrics for dashboard charts",
    },
    async () => {
      try {
        const dashboardMetricsData = await fetch(
          `${HOSTDATA_URL}/metrics/dashboard`
        );
        const dashboardMetricsDataJson = await dashboardMetricsData.json();

        return {
          contents: [
            {
              uri: "metrics://dashboard",
              mimeType: "application/json",
              text: JSON.stringify(dashboardMetricsDataJson, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Error fetching customers data:", error);
        return {
          contents: [],
        };
      }
    }
  );

  // Revenue breakdown resource
  server.registerResource(
    "items-data",
    "items://all",
    {
      title: "Items Data",
      description: "Items data for dashboard charts",
    },
    async () => {
      try {
        const itemsData = await fetch(`${HOSTDATA_URL}/items`);
        const itemsDataJson = await itemsData.json();

        return {
          contents: [
            {
              uri: "items://all",
              mimeType: "application/json",
              text: JSON.stringify(itemsDataJson, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Error fetching customers data:", error);
        return {
          contents: [],
        };
      }
    }
  );
}
