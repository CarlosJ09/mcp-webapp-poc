import { useState, useEffect, useCallback } from 'react';
import { mcpClient, safeMCP } from '@/lib/mcp-client';
import type { DashboardState, SalesData, UserAnalytics, PerformanceData, RevenueData } from '@/types/dashboard';

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>({
    salesData: [],
    userAnalytics: null,
    performanceData: [],
    revenueData: [],
    loading: true,
    error: null,
  });

  const updateState = (updates: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const loadDashboardData = useCallback(async () => {
    updateState({ loading: true, error: null });

    try {
      // Initialize MCP connection
      const { error: initError } = await safeMCP(async () => {
        return await mcpClient.initialize();
      });

      if (initError) {
        updateState({ error: initError, loading: false });
        return;
      }

      // Load all dashboard data in parallel
      const [salesResult, analyticsResult, performanceResult, revenueResult] =
        await Promise.all([
          safeMCP(() => mcpClient.readResource("sales://monthly")),
          safeMCP(() => mcpClient.readResource("analytics://users")),
          safeMCP(() => mcpClient.readResource("metrics://performance")),
          safeMCP(() => mcpClient.readResource("revenue://breakdown")),
        ]);

      // Process and update data
      const updates: Partial<DashboardState> = {};

      if (salesResult.data) {
        const salesContent: SalesData[] = JSON.parse(salesResult.data.contents[0].text);
        updates.salesData = salesContent;
      }

      if (analyticsResult.data) {
        const analyticsContent: UserAnalytics = JSON.parse(
          analyticsResult.data.contents[0].text
        );
        updates.userAnalytics = analyticsContent;
      }

      if (performanceResult.data) {
        const performanceContent: PerformanceData[] = JSON.parse(
          performanceResult.data.contents[0].text
        );
        updates.performanceData = performanceContent;
      }

      if (revenueResult.data) {
        const revenueContent: RevenueData[] = JSON.parse(
          revenueResult.data.contents[0].text
        );
        updates.revenueData = revenueContent;
      }

      updateState({ ...updates, error: null, loading: false });
    } catch (err) {
      updateState({
        error: err instanceof Error ? err.message : "Unknown error",
        loading: false,
      });
    }
  }, []);

  const refreshData = useCallback(async () => {
    updateState({ loading: true });

    const [salesResult, analyticsResult, performanceResult, revenueResult] =
      await Promise.all([
        safeMCP(() => mcpClient.readResource("sales://monthly")),
        safeMCP(() => mcpClient.readResource("analytics://users")),
        safeMCP(() => mcpClient.readResource("metrics://performance")),
        safeMCP(() => mcpClient.readResource("revenue://breakdown")),
      ]);

    const updates: Partial<DashboardState> = {};

    if (salesResult.data) {
      updates.salesData = JSON.parse(salesResult.data.contents[0].text);
    }
    if (analyticsResult.data) {
      updates.userAnalytics = JSON.parse(analyticsResult.data.contents[0].text);
    }
    if (performanceResult.data) {
      updates.performanceData = JSON.parse(performanceResult.data.contents[0].text);
    }
    if (revenueResult.data) {
      updates.revenueData = JSON.parse(revenueResult.data.contents[0].text);
    }

    updateState({ ...updates, loading: false });
  }, []);

  // Initialize data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    ...state,
    refreshData,
  };
}
