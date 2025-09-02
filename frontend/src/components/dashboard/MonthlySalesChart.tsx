/**
 * Monthly Sales Chart Component
 * Displays monthly sales metrics with business logic integration
 */

import { TrendingUp, Users, DollarSign, ShoppingCart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { SalesMetricsByMonth } from "@/types/dashboard";

interface MonthlySalesChartProps {
  data: SalesMetricsByMonth;
  loading?: boolean;
}

export function MonthlySalesChart({
  data,
  loading = false,
}: MonthlySalesChartProps) {
  // Transform the single month data into chart format
  const chartData = [
    {
      month: data.month || "Loading...",
      totalSales: data.total_sales || 0,
      totalRevenue: data.total_revenue
        ? parseFloat(data.total_revenue.replace(/[^0-9.-]+/g, "")) || 0
        : 0,
      avgOrderValue: data.avg_order_value
        ? parseFloat(data.avg_order_value.replace(/[^0-9.-]+/g, "")) || 0
        : 0,
      uniqueCustomers: data.unique_customers || 0,
    },
  ];

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const formatNumber = (value: number) => value.toLocaleString();

  const formatTooltip = (value: number, name: string) => {
    switch (name) {
      case "totalSales":
        return [formatNumber(value), "Total Sales"];
      case "totalRevenue":
        return [formatCurrency(value), "Total Revenue"];
      case "avgOrderValue":
        return [formatCurrency(value), "Average Order Value"];
      case "uniqueCustomers":
        return [formatNumber(value), "Unique Customers"];
      default:
        return [value, name];
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Check if we have valid data to display
  if (!data || !data.month) {
    console.log("No data available");
    console.log("data:", data);
    console.log("data.month:", data.month);
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Monthly Sales Analysis - {data.month}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Business logic integrated sales metrics for {data.month}
        </p>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">
              Total Sales
            </span>
          </div>
          <div className="text-lg font-semibold text-blue-900">
            {formatNumber(data.total_sales || 0)}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-600 font-medium">Revenue</span>
          </div>
          <div className="text-lg font-semibold text-green-900">
            {data.total_revenue || "$0"}
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">
              Avg Order
            </span>
          </div>
          <div className="text-lg font-semibold text-purple-900">
            {data.avg_order_value || "$0"}
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">
              Customers
            </span>
          </div>
          <div className="text-lg font-semibold text-orange-900">
            {formatNumber(data.unique_customers || 0)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart for Sales and Revenue */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Sales & Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Bar
                dataKey="totalSales"
                fill="#3B82F6"
                name="Total Sales"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="totalRevenue"
                fill="#10B981"
                name="Total Revenue"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart for Trends */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">
            Performance Metrics
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgOrderValue"
                stroke="#8B5CF6"
                strokeWidth={3}
                name="Average Order Value"
                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="uniqueCustomers"
                stroke="#F59E0B"
                strokeWidth={3}
                name="Unique Customers"
                dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Business Logic Insights */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-3">
          Business Logic Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">
              Customer Acquisition:
            </span>
            <span className="ml-2 text-gray-800">
              {data.unique_customers || 0} new customers in{" "}
              {data.month || "this month"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Sales Efficiency:</span>
            <span className="ml-2 text-gray-800">
              {data.total_sales > 0 && data.total_revenue
                ? (
                    parseFloat(data.total_revenue.replace(/[^0-9.-]+/g, "")) /
                    data.total_sales
                  ).toFixed(2)
                : 0}{" "}
              revenue per sale
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">
              Market Penetration:
            </span>
            <span className="ml-2 text-gray-800">
              {data.total_sales > 0
                ? (
                    ((data.unique_customers || 0) / data.total_sales) *
                    100
                  ).toFixed(1)
                : 0}
              % customer conversion rate
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Revenue Growth:</span>
            <span className="ml-2 text-gray-800">
              {data.total_revenue || "$0"} total revenue with{" "}
              {data.avg_order_value || "$0"} average order
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
