import { useState, useEffect, useCallback } from "react";
import { useMCPResource, useMCPConnection, useMCPTool } from "@/hooks/useMCP";
import {
  DashboardStateWithLogic,
  SalesMetricsByMonth,
} from "@/types/dashboard";
import { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";

export function useMCPWithLogicDashboardData() {
  const [state, setState] = useState<DashboardStateWithLogic>({
    salesMetricsData: {
      month: "",
      total_sales: 0,
      total_revenue: "",
      avg_order_value: "",
      unique_customers: 0,
    },
    loading: true,
    error: null,
  });

  const [loadingSalesMetrics, setLoadingSalesMetrics] = useState(false);

  const { readResourceData } = useMCPResource();
  const { executeTool } = useMCPTool();
  const { isConnected } = useMCPConnection();

  const updateState = (updates: Partial<DashboardStateWithLogic>) => {
    console.log("Updating state with:", updates);
    setState((prev) => {
      const newState = { ...prev, ...updates };
      console.log("New state:", newState);
      return newState;
    });
  };

  const loadDashboardData = useCallback(async () => {
    if (!isConnected) {
      updateState({ error: "MCP client not connected", loading: false });
      return;
    }

    console.log("Loading dashboard data...");
    updateState({ loading: true, error: null });

    try {
      const toolsRequests: CallToolRequest[] = [
        {
          params: {
            name: "sales-monthly-analysis",
            arguments: { months: 12 },
          },
          method: "tools/call",
        },
      ];

      console.log("Making parallel requests for tools...");
      setLoadingSalesMetrics(true);
      const [salesMetricsResult] = await Promise.all([
        executeTool(toolsRequests[0]),
      ]);

      console.log("Sales metrics result:", salesMetricsResult);
      console.log("Sales metrics result.content:", salesMetricsResult?.content);
      console.log("Sales metrics result.content[0]:", salesMetricsResult?.content?.[0]);
      console.log("Sales metrics result.content[0].text:", salesMetricsResult?.content?.[0]?.text);

      // Process and update data
      const updates: Partial<DashboardStateWithLogic> = {};

      if (salesMetricsResult?.content?.[0]?.text) {
        try {
          const parsedData = JSON.parse(salesMetricsResult.content[0].text);
          console.log("Parsed data:", parsedData);
          
          // Handle case where server returns an array
          let salesMetricsContent: SalesMetricsByMonth;
          if (Array.isArray(parsedData)) {
            // If it's an array, take the first element
            salesMetricsContent = parsedData[0];
            console.log("Data is array, taking first element:", salesMetricsContent);
          } else {
            // If it's already an object, use it directly
            salesMetricsContent = parsedData;
            console.log("Data is object, using directly:", salesMetricsContent);
          }
          
          updates.salesMetricsData = salesMetricsContent;
          console.log("Sales metrics processed:", salesMetricsContent);
          console.log("Updates object:", updates);
        } catch (parseError) {
          console.error("Error parsing sales metrics data:", parseError);
        }
      } else {
        console.warn("No content found in salesMetricsResult:", salesMetricsResult);
      }

      console.log("About to update state with:", updates);
      updateState({ ...updates, error: null, loading: false });
      console.log("Dashboard data loading completed successfully");
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      updateState({
        error: err instanceof Error ? err.message : "Unknown error occurred",
        loading: false,
      });
    } finally {
      setLoadingSalesMetrics(false);
    }
  }, [isConnected, readResourceData, executeTool]);

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

  // Debug log for current state
  useEffect(() => {
    console.log("Current state in hook:", state);
  }, [state]);

  return {
    ...state,
    loadingSalesMetrics,
    refreshData,
    isConnected,
  };
}
