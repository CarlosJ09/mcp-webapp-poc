/**
 * Sales Chart Component
 * Displays sales, revenue, and profit trends over time with period selector
 */

import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PeriodSelector } from "./PeriodSelector";
import type { SalesMetrics, Period } from "@/types/dashboard";

interface SalesChartProps {
  data: SalesMetrics;
  currentPeriod: Period;
  onPeriodChange: (period: Period) => void;
  loading?: boolean;
}

export function SalesChart({
  data,
  currentPeriod,
  onPeriodChange,
  loading = false,
}: SalesChartProps) {
  const formatTooltip = (value: number) => [`$${value.toLocaleString()}`, ""];

  const chartData = data.salesByPeriod.map((item) => ({
    ...item,
    profit: item.revenue ? item.revenue * 0.2 : 0, // 20% profit margin
  }));

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Sales & Revenue Trends
        </h2>
        <PeriodSelector
          selectedPeriod={currentPeriod}
          onPeriodChange={onPeriodChange}
          loading={loading}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            <Line
              type="monotone"
              dataKey="salesCount"
              stroke="#8884d8"
              strokeWidth={3}
              name="Sales"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#82ca9d"
              strokeWidth={3}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#ffc658"
              strokeWidth={3}
              name="Profit"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
