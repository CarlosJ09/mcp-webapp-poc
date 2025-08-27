import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerDashboardResources(server: McpServer) {
  // Sales data resource
  server.registerResource(
    "sales-data",
    "sales://monthly",
    { 
      title: "Monthly Sales Data",
      description: "Sales metrics by month for dashboard charts"
    },
    async () => {
      const salesData = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
        sales: Math.floor(Math.random() * 100000) + 50000,
        revenue: Math.floor(Math.random() * 200000) + 100000,
        profit: Math.floor(Math.random() * 50000) + 20000,
      }));

      return {
        contents: [{
          uri: "sales://monthly",
          mimeType: "application/json",
          text: JSON.stringify(salesData, null, 2)
        }]
      };
    }
  );

  // User analytics resource
  server.registerResource(
    "user-analytics",
    "analytics://users",
    { 
      title: "User Analytics",
      description: "User engagement and demographic data"
    },
    async () => {
      const userAnalytics = {
        demographics: [
          { age: "18-24", users: Math.floor(Math.random() * 5000) + 2000 },
          { age: "25-34", users: Math.floor(Math.random() * 8000) + 5000 },
          { age: "35-44", users: Math.floor(Math.random() * 6000) + 3000 },
          { age: "45-54", users: Math.floor(Math.random() * 4000) + 2000 },
          { age: "55+", users: Math.floor(Math.random() * 3000) + 1000 },
        ],
        engagement: Array.from({ length: 7 }, (_, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          activeUsers: Math.floor(Math.random() * 15000) + 10000,
          sessions: Math.floor(Math.random() * 25000) + 20000,
        }))
      };

      return {
        contents: [{
          uri: "analytics://users",
          mimeType: "application/json",
          text: JSON.stringify(userAnalytics, null, 2)
        }]
      };
    }
  );

  // Performance metrics resource
  server.registerResource(
    "performance-metrics",
    "metrics://performance",
    { 
      title: "Performance Metrics",
      description: "System performance and response time metrics"
    },
    async () => {
      const performanceData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        responseTime: Math.random() * 500 + 100,
        throughput: Math.random() * 1000 + 500,
        errorRate: Math.random() * 5,
      }));

      return {
        contents: [{
          uri: "metrics://performance",
          mimeType: "application/json",
          text: JSON.stringify(performanceData, null, 2)
        }]
      };
    }
  );

  // Revenue breakdown resource
  server.registerResource(
    "revenue-breakdown",
    "revenue://breakdown",
    { 
      title: "Revenue Breakdown",
      description: "Revenue sources and distribution"
    },
    async () => {
      const revenueBreakdown = [
        { source: "Subscriptions", value: Math.floor(Math.random() * 500000) + 300000, color: "#8884d8" },
        { source: "One-time Sales", value: Math.floor(Math.random() * 200000) + 100000, color: "#82ca9d" },
        { source: "Partnerships", value: Math.floor(Math.random() * 150000) + 75000, color: "#ffc658" },
        { source: "Advertising", value: Math.floor(Math.random() * 100000) + 50000, color: "#ff7300" },
        { source: "Other", value: Math.floor(Math.random() * 50000) + 25000, color: "#0088fe" },
      ];

      return {
        contents: [{
          uri: "revenue://breakdown",
          mimeType: "application/json",
          text: JSON.stringify(revenueBreakdown, null, 2)
        }]
      };
    }
  );
}
