"use client";

import { useDashboardData } from "@/hooks/useDashboardData";
import { KPICards } from "@/components/dashboard/KPICards";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { CustomerDistributionChart } from "@/components/dashboard/CustomerDistributionChart";
import { InventoryChart } from "@/components/dashboard/InventoryChart";

export default function MCPWithLogicDashboardPage() {
  const {
    salesMetricsData,
    customersMetricsData,
    dashboardMetricsData,
    inventoryMetricsData,
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
    <div className="px-4 py-6 sm:px-0">
      <div className="mt-8">
        <KPICards metrics={kpiMetrics} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart
          data={salesMetricsData}
          loading={loadingSalesMetrics}
          currentPeriod={currentPeriod}
          onPeriodChange={changePeriod}
        />
        <CustomerDistributionChart data={customersMetricsData} />
      </div>

      <div className="mt-6">
        <InventoryChart data={inventoryMetricsData} />
      </div>
    </div>
  );
}
