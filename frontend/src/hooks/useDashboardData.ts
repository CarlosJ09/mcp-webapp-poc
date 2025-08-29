import { useState, useEffect, useCallback } from "react";
import { useMCPResource, useMCPConnection, useMCPTool } from "@/hooks/useMCP";
import {
  DashboardState,
  Sale,
  Customer,
  DashboardMetricsData,
  Item,
  Period,
  SalesMetrics,
} from "@/types/dashboard";
import {
  ReadResourceRequest,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>({
    salesData: [],
    customersData: [],
    dashboardMetricsData: {
      totalSales: 0,
      totalCustomers: 0,
      totalItems: 0,
      topSellingItems: [],
      topCustomers: [],
    },
    salesMetricsData: {
      period: Period.MONTHLY,
      totalSales: 0,
      totalRevenue: null,
      salesByPeriod: [],
    },
    itemsData: [],
    loading: true,
    error: null,
  });

  const { readResourceData } = useMCPResource();
  const { executeTool } = useMCPTool();
  const { isConnected } = useMCPConnection();

  const updateState = (updates: Partial<DashboardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const loadDashboardData = useCallback(async () => {
    if (!isConnected) {
      updateState({ error: "MCP client not connected", loading: false });
      return;
    }

    console.log("Loading dashboard data...");
    updateState({ loading: true, error: null });

    try {
      const resourceRequests: ReadResourceRequest[] = [
        { params: { uri: "sales://all" }, method: "resources/read" },
        { params: { uri: "customers://all" }, method: "resources/read" },
        { params: { uri: "metrics://dashboard" }, method: "resources/read" },
        { params: { uri: "items://all" }, method: "resources/read" },
      ];

      const toolsRequests: CallToolRequest[] = [
        {
          params: {
            name: "get-sales-metrics",
            arguments: { period: Period.MONTHLY },
          },
          method: "tools/call",
        },
      ];

      console.log("Making parallel requests for tools...");
      const [salesMetricsResult] = await Promise.all([
        executeTool(toolsRequests[0]),
      ]);

      console.log("Sales metrics result:", salesMetricsResult);
      // Load all dashboard data in parallel
      console.log("Making parallel requests for resources...");
      const [
        salesResult,
        customersResult,
        dashboardMetricsResult,
        itemsResult,
      ] = await Promise.all([
        readResourceData(resourceRequests[0]),
        readResourceData(resourceRequests[1]),
        readResourceData(resourceRequests[2]),
        readResourceData(resourceRequests[3]),
      ]);

      console.log("All resources loaded, processing data...");

      // Process and update data
      const updates: Partial<DashboardState> = {};

      if (salesMetricsResult?.content?.[0]?.text) {
        try {
          const salesMetricsContent: SalesMetrics = JSON.parse(
            salesMetricsResult.content[0].text
          );
          updates.salesMetricsData = salesMetricsContent;
          console.log("Sales metrics processed:", salesMetricsContent);
        } catch (parseError) {
          console.error("Error parsing sales metrics data:", parseError);
        }
      }

      if (salesResult?.contents?.[0]?.text) {
        try {
          const salesContent: Sale[] = JSON.parse(salesResult.contents[0].text);
          updates.salesData = salesContent;
          console.log("Sales data processed:", salesContent.length, "items");
        } catch (parseError) {
          console.error("Error parsing sales data:", parseError);
        }
      }

      if (customersResult?.contents?.[0]?.text) {
        try {
          const customersContent: Customer[] = JSON.parse(
            customersResult.contents[0].text
          );
          updates.customersData = customersContent;
          console.log(
            "Customers data processed:",
            customersContent.length,
            "items"
          );
        } catch (parseError) {
          console.error("Error parsing customers data:", parseError);
        }
      }

      if (dashboardMetricsResult?.contents?.[0]?.text) {
        try {
          const dashboardMetricsContent: DashboardMetricsData = JSON.parse(
            dashboardMetricsResult.contents[0].text
          );
          updates.dashboardMetricsData = dashboardMetricsContent;
          console.log("Dashboard metrics processed:", dashboardMetricsContent);
        } catch (parseError) {
          console.error("Error parsing dashboard metrics data:", parseError);
        }
      }

      if (itemsResult?.contents?.[0]?.text) {
        try {
          const itemsContent: Item[] = JSON.parse(itemsResult.contents[0].text);
          updates.itemsData = itemsContent;
          console.log("Items data processed:", itemsContent.length, "items");
        } catch (parseError) {
          console.error("Error parsing items data:", parseError);
        }
      }

      updateState({ ...updates, error: null, loading: false });
      console.log("Dashboard data loading completed successfully");
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      updateState({
        error: err instanceof Error ? err.message : "Unknown error occurred",
        loading: false,
      });
    }
  }, [isConnected, readResourceData]);

  const refreshData = useCallback(async () => {
    if (!isConnected) {
      updateState({ error: "MCP client not connected" });
      return;
    }

    console.log("Refreshing dashboard data...");
    updateState({ loading: true, error: null });

    try {
      const resourceRequests: ReadResourceRequest[] = [
        { params: { uri: "sales://all" }, method: "resources/read" },
        { params: { uri: "customers://all" }, method: "resources/read" },
        { params: { uri: "metrics://dashboard" }, method: "resources/read" },
        { params: { uri: "items://all" }, method: "resources/read" },
      ];

      const [
        salesResult,
        customersResult,
        dashboardMetricsResult,
        itemsResult,
      ] = await Promise.all([
        readResourceData(resourceRequests[0]),
        readResourceData(resourceRequests[1]),
        readResourceData(resourceRequests[2]),
        readResourceData(resourceRequests[3]),
      ]);

      const updates: Partial<DashboardState> = {};

      if (salesResult?.contents?.[0]?.text) {
        updates.salesData = JSON.parse(salesResult.contents[0].text);
      }
      if (customersResult?.contents?.[0]?.text) {
        updates.customersData = JSON.parse(customersResult.contents[0].text);
      }
      if (dashboardMetricsResult?.contents?.[0]?.text) {
        updates.dashboardMetricsData = JSON.parse(
          dashboardMetricsResult.contents[0].text
        );
      }
      if (itemsResult?.contents?.[0]?.text) {
        updates.itemsData = JSON.parse(itemsResult.contents[0].text);
      }

      updateState({ ...updates, error: null, loading: false });
      console.log("Dashboard data refresh completed");
    } catch (err) {
      console.error("Error refreshing dashboard data:", err);
      updateState({
        error: err instanceof Error ? err.message : "Failed to refresh data",
        loading: false,
      });
    }
  }, [isConnected, readResourceData]);

  // Initialize data when MCP connection is ready
  useEffect(() => {
    console.log("useDashboardData effect - isConnected:", isConnected);
    if (isConnected) {
      loadDashboardData();
    }
  }, [isConnected, loadDashboardData]);

  return {
    ...state,
    refreshData,
    isConnected,
  };
}
