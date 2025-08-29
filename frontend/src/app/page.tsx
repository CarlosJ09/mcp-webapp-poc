"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import {
  DashboardHeader,
  KPICards,
  SalesChart,
  CustomerDistributionChart,
} from "@/components/dashboard";

export default function Dashboard() {
  const {
    salesMetricsData,
    customersMetricsData,
    dashboardMetricsData,
    itemsData,
    loading,
    error,
    refreshData,
    currentPeriod,
    loadingSalesMetrics,
    changePeriod,
  } = useDashboardData();

  const kpiMetrics = {
    totalSales: dashboardMetricsData?.totalSales ?? 0,
    totalCustomers: dashboardMetricsData?.totalCustomers ?? 0,
    totalItems: dashboardMetricsData?.totalItems ?? 0,
    totalRevenue: dashboardMetricsData?.totalRevenue ?? 0,
  };

  console.log("dashboardMetricsData", dashboardMetricsData);

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader error={error} onRefresh={refreshData} />

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* KPI Cards */}
          <KPICards metrics={kpiMetrics} />

          {/* Sales Trends with Period Selector */}
          <SalesChart
            data={salesMetricsData}
            currentPeriod={currentPeriod}
            onPeriodChange={changePeriod}
            loading={loadingSalesMetrics}
          />

          <CustomerDistributionChart data={customersMetricsData} />

          {/* <UserEngagementChart data={itemsData || []} /> */}

          {/* Performance Metrics */}
          {/* <PerformanceChart data={dashboardMetricsData} /> */}
        </div>
      </main>
    </div>
  );
}
