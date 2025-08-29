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
    salesData,
    customersData,
    dashboardMetricsData,
    itemsData,
    loading,
    error,
    refreshData,
  } = useDashboardData();

  const kpiMetrics = {
    totalSales: dashboardMetricsData?.[0]?.totalSales ?? 0,
    totalCustomers: dashboardMetricsData?.[0]?.totalCustomers ?? 0,
    totalItems: dashboardMetricsData?.[0]?.totalItems ?? 0,
    totalRevenue: dashboardMetricsData?.[0]?.totalRevenue ?? 0,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto px-4">
        <DashboardHeader error={error} onRefresh={refreshData} />
        {/* Main Dashboard */}
        <main>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Error loading dashboard data: {error}
                  </p>
                  <button
                    onClick={refreshData}
                    className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs px-2 py-1 rounded"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* KPI Cards */}
            <KPICards metrics={kpiMetrics} />

            {/* Charts */}
            <SalesChart data={salesData} />
            {/* 
            <RevenueChart data={revenueData} />
            <UserDemographicsChart data={customersData || []} />
            <UserEngagementChart data={userAnalytics?.engagement || []} />
            <PerformanceChart data={performanceData} /> 
            */}
          </div>
        </main>
      </div>
    </div>
  );
}
