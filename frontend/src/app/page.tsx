"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import {
  DashboardHeader,
  KPICards,
  SalesChart,
  RevenueChart,
  UserDemographicsChart,
  UserEngagementChart,
  PerformanceChart,
} from "@/components/dashboard";

export default function Dashboard() {
  const {
    salesMetricsData,
    customersData,
    dashboardMetricsData,
    itemsData,
    loading,
    error,
    refreshData,
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

          {/* Sales Trends */}
          <SalesChart data={salesMetricsData} />

          {/*         <UserDemographicsChart data={customersData || []} />

        <UserEngagementChart data={itemsData || []} /> */}

          {/* Performance Metrics */}
          {/* <PerformanceChart data={dashboardMetricsData} /> */}
        </div>
      </main>
    </div>
  );
}
