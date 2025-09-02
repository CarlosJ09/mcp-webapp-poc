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
  CustomerMetrics,
  InventoryMetricsData,
} from "@/types/dashboard";
import {
  ReadResourceRequest,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";

export function useMCPWithLogicDashboardData() {
  const [state, setState] = useState<DashboardState>({
    salesData: [],
    customersData: [],
    customersMetricsData: {
      totalCustomers: 0,
      newCustomersThisMonth: 0,
      averageCustomerValue: null,
      customerDistribution: [],
    },
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
    inventoryMetricsData: {
      totalItems: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      totalInventoryValue: 0,
      lowStockList: [],
    },
    itemsData: [],
    loading: true,
    error: null,
  });

  const [currentPeriod, setCurrentPeriod] = useState<Period>(Period.MONTHLY);
  const [loadingSalesMetrics, setLoadingSalesMetrics] = useState(false);

  const { readResourceData } = useMCPResource();
  const { executeTool } = useMCPTool();
  const { isConnected } = useMCPConnection();

  const updateState = (updates: Partial<DashboardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const loadSalesMetrics = useCallback(
    async (period: Period) => {
      if (!isConnected) {
        console.error("MCP client not connected");
        return;
      }

      console.log(`Loading sales metrics for period: ${period}`);
      setLoadingSalesMetrics(true);

      try {
        const salesMetricsRequest: CallToolRequest = {
          params: {
            name: "get-sales-metrics",
            arguments: { period },
          },
          method: "tools/call",
        };

        const salesMetricsResult = await executeTool(salesMetricsRequest);

        if (salesMetricsResult?.content?.[0]?.text) {
          const salesMetricsContent: SalesMetrics = JSON.parse(
            salesMetricsResult.content[0].text
          );
          updateState({ salesMetricsData: salesMetricsContent });
          console.log(
            `Sales metrics loaded for ${period}:`,
            salesMetricsContent
          );
        }
      } catch (err) {
        console.error("Error loading sales metrics:", err);
        updateState({
          error:
            err instanceof Error ? err.message : "Failed to load sales metrics",
        });
      } finally {
        setLoadingSalesMetrics(false);
      }
    },
    [isConnected, executeTool]
  );

  const changePeriod = useCallback(
    (newPeriod: Period) => {
      console.log(`Changing period from ${currentPeriod} to ${newPeriod}`);
      setCurrentPeriod(newPeriod);
      loadSalesMetrics(newPeriod);
    },
    [currentPeriod, loadSalesMetrics]
  );

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
            arguments: { period: currentPeriod },
          },
          method: "tools/call",
        },
        {
          params: {
            name: "get-customers-metrics",
          },
          method: "tools/call",
        },
        {
          params: {
            name: "get-inventory-metrics",
          },
          method: "tools/call",
        },
      ];

      console.log("Making parallel requests for tools...");
      const [
        salesMetricsResult,
        customersMetricsResult,
        inventoryMetricsResult,
      ] = await Promise.all([
        executeTool(toolsRequests[0]),
        executeTool(toolsRequests[1]),
        executeTool(toolsRequests[2]),
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

      if (customersMetricsResult?.content?.[0]?.text) {
        try {
          const customersMetricsContent: CustomerMetrics = JSON.parse(
            customersMetricsResult.content[0].text
          );
          updates.customersMetricsData = customersMetricsContent;
          console.log("Customers metrics processed:", customersMetricsContent);
        } catch (parseError) {
          console.error("Error parsing customers metrics data:", parseError);
        }
      }

      if (inventoryMetricsResult?.content?.[0]?.text) {
        try {
          const inventoryMetricsContent: InventoryMetricsData = JSON.parse(
            inventoryMetricsResult.content[0].text
          );
          updates.inventoryMetricsData = inventoryMetricsContent;
          console.log("Inventory metrics processed:", inventoryMetricsContent);
        } catch (parseError) {
          console.error("Error parsing inventory metrics data:", parseError);
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
  }, [isConnected, readResourceData, currentPeriod, executeTool]);

  const refreshData = useCallback(async () => {
    if (!isConnected) {
      updateState({ error: "MCP client not connected" });
      return;
    }

    console.log("Refreshing dashboard data...");
    await loadDashboardData();
  }, [isConnected, loadDashboardData]);

  // Initialize data when MCP connection is ready
  useEffect(() => {
    console.log("useDashboardData effect - isConnected:", isConnected);
    if (isConnected) {
      loadDashboardData();
    }
  }, [isConnected, loadDashboardData]);

  return {
    ...state,
    currentPeriod,
    loadingSalesMetrics,
    refreshData,
    changePeriod,
    isConnected,
  };
}
