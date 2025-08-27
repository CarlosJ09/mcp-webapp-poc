"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { calculateKPIs } from "@/utils/calculations";
import { LoadingSpinner } from "@/components/ui";
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
  // Use custom hook for data management
  const { salesData, userAnalytics, performanceData, revenueData, loading, error, refreshData } = useDashboardData();

  // Calculate KPI metrics
  const kpiMetrics = calculateKPIs(salesData, userAnalytics, performanceData);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader error={error} onRefresh={refreshData} />

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* KPI Cards */}
          <KPICards metrics={kpiMetrics} />

          {/* Sales Trends */}
          <SalesChart data={salesData} />

          {/* Revenue Breakdown */}
          <RevenueChart data={revenueData} />

          {/* User Demographics */}
          <UserDemographicsChart data={userAnalytics?.demographics || []} />

          {/* User Engagement */}
          <UserEngagementChart data={userAnalytics?.engagement || []} />

          {/* Performance Metrics */}
          <PerformanceChart data={performanceData} />
        </div>
      </main>
    </div>
  );
}
