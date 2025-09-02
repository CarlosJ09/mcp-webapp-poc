"use client";

import { MonthlySalesChart } from "@/components/dashboard/MonthlySalesChart";
import { useMCPWithLogicDashboardData } from "@/hooks/useMCPWithLogicDashboardData";

export default function MCPWithLogicPage() {
  const { salesMetricsData, loadingSalesMetrics } =
    useMCPWithLogicDashboardData();

  // Debug logs
  console.log("MCPWithLogicPage - salesMetricsData:", salesMetricsData);
  console.log("MCPWithLogicPage312312312ed12d12d12e - salesMetricsData:", salesMetricsData);
  console.log("MCPWithLogicPage - loadingSalesMetrics:", loadingSalesMetrics);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">MCP with Logic</h1>
        <p className="mt-2 text-gray-600">
          This page demonstrates the MCP protocol with business logic
          integration.
        </p>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          MCP Protocol Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Protocol Benefits</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Structured data exchange</li>
              <li>• Type-safe communication</li>
              <li>• Extensible tool system</li>
              <li>• Standardized interfaces</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">
              Business Logic Integration
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Custom tool implementations</li>
              <li>• Business rule enforcement</li>
              <li>• Data validation</li>
              <li>• Workflow automation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <MonthlySalesChart 
          data={salesMetricsData} 
          loading={loadingSalesMetrics} 
        />
      </div>
    </div>
  );
}
