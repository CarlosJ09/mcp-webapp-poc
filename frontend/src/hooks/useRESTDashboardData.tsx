import { useState, useEffect, useCallback } from "react";
import { Period, SalesMetrics } from "@/types/dashboard";

interface RESTDashboardState {
  salesMetricsData: SalesMetrics;
  loading: boolean;
  error: string | null;
}

export function useRESTDashboardData() {
  const [state, setState] = useState<RESTDashboardState>({
    salesMetricsData: {
      period: Period.MONTHLY,
      totalSales: 0,
      totalRevenue: null,
      salesByPeriod: [],
    },
    loading: true,
    error: null,
  });

  const [currentPeriod, setCurrentPeriod] = useState<Period>(Period.MONTHLY);
  const [loadingSalesMetrics, setLoadingSalesMetrics] = useState(false);

  const updateState = (updates: Partial<RESTDashboardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const loadSalesMetrics = useCallback(async (period: Period) => {
    const backendUrl = process.env.NEXT_PUBLIC_REST_BACKEND_URL;
    
    if (!backendUrl) {
      console.error("REST backend URL not configured");
      updateState({
        error: "REST backend URL not configured",
      });
      return;
    }

    console.log(`Loading sales metrics for period: ${period}`);
    setLoadingSalesMetrics(true);

    try {
      const response = await fetch(
        `${backendUrl}/metrics/sales-summary?period=${encodeURIComponent(period)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const salesMetricsData: SalesMetrics = await response.json();
      updateState({ salesMetricsData: salesMetricsData });
      console.log(`Sales metrics loaded for ${period}:`, salesMetricsData);
    } catch (err) {
      console.error("Error loading sales metrics:", err);
      updateState({
        error: err instanceof Error ? err.message : "Failed to load sales metrics",
      });
    } finally {
      setLoadingSalesMetrics(false);
    }
  }, []);

  const changePeriod = useCallback(
    (newPeriod: Period) => {
      console.log(`Changing period from ${currentPeriod} to ${newPeriod}`);
      setCurrentPeriod(newPeriod);
      loadSalesMetrics(newPeriod);
    },
    [currentPeriod, loadSalesMetrics]
  );

  const loadDashboardData = useCallback(async () => {
    console.log("Loading dashboard data via REST API...");
    updateState({ loading: true, error: null });

    try {
      await loadSalesMetrics(currentPeriod);
      updateState({ error: null, loading: false });
      console.log("Dashboard data loading completed successfully");
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      updateState({
        error: err instanceof Error ? err.message : "Unknown error occurred",
        loading: false,
      });
    }
  }, [currentPeriod, loadSalesMetrics]);

  const refreshData = useCallback(async () => {
    console.log("Refreshing dashboard data...");
    await loadDashboardData();
  }, [loadDashboardData]);

  // Initialize data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    ...state,
    currentPeriod,
    loadingSalesMetrics,
    refreshData,
    changePeriod,
  };
}
