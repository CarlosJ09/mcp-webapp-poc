"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { KPICards } from "@/components/dashboard/KPICards";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { CustomerDistributionChart } from "@/components/dashboard/CustomerDistributionChart";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function Dashboard() {
  const {
    salesMetricsData,
    customersMetricsData,
    dashboardMetricsData,
    inventoryMetricsData,
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

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader error={error} onRefresh={refreshData} />

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <KPICards metrics={kpiMetrics} />

          <SalesChart
            data={salesMetricsData}
            currentPeriod={currentPeriod}
            onPeriodChange={changePeriod}
            loading={loadingSalesMetrics}
          />

          <CustomerDistributionChart data={customersMetricsData} />

          <div className="lg:col-span-2">
            <InventoryChart data={inventoryMetricsData} />
          </div>
        </div>
      </main>
    </div>
  );
}
