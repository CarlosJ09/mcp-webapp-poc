"use client";

import { KPICards } from "@/components/dashboard/KPICards";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { CustomerDistributionChart } from "@/components/dashboard/CustomerDistributionChart";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { useRESTDashboardData } from "@/hooks/useRESTDashboardData";

export default function RESTAPIPage() {
  const {
    salesMetricsData,
    loading,
    error,
    changePeriod,
    currentPeriod,
    loadingSalesMetrics,
  } = useRESTDashboardData();

  const kpiMetrics = {
    /*    totalSales: dashboardMetricsData?.totalSales ?? 0,
    totalCustomers: dashboardMetricsData?.totalCustomers ?? 0,
    totalItems: dashboardMetricsData?.totalItems ?? 0,
    totalRevenue: dashboardMetricsData?.totalRevenue ?? 0, */
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">REST API</h1>
        <p className="mt-2 text-gray-600">
          Traditional REST API approach for data fetching and manipulation.
        </p>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          REST API Characteristics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Standard HTTP Methods</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• GET - Retrieve data</li>
              <li>• POST - Create new resources</li>
              <li>• PUT - Update existing resources</li>
              <li>• DELETE - Remove resources</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">REST Principles</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Stateless communication</li>
              <li>• Resource-based URLs</li>
              <li>• JSON/XML responses</li>
              <li>• Standard status codes</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">{/*  <KPICards metrics={kpiMetrics} /> */}</div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart
          data={salesMetricsData}
          loading={loadingSalesMetrics}
          currentPeriod={currentPeriod}
          onPeriodChange={changePeriod}
        />
        {/* <CustomerDistributionChart data={customersMetricsData} /> */}
      </div>

      <div className="mt-6">
        {/*  <InventoryChart data={inventoryMetricsData} /> */}
      </div>
    </div>
  );
}
