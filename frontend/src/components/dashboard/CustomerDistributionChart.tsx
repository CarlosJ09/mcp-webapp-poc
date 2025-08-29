/**
 * Customer Distribution Chart Component
 * Displays customer distribution by different ranges/segments
 */

import { Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CustomerMetrics } from "@/types/dashboard";

interface CustomerDistributionChartProps {
  data: CustomerMetrics;
}

export function CustomerDistributionChart({
  data,
}: CustomerDistributionChartProps) {
  const formatTooltip = (value: number, name: string) => [
    `${value.toLocaleString()} customers`,
    name === "count" ? "Count" : name,
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <Users className="h-5 w-5" />
        Customer Distribution
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data.customerDistribution}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis />
          <Tooltip formatter={formatTooltip} />
          <Bar
            dataKey="count"
            fill="#8884d8"
            name="Customers"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
