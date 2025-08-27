/**
 * Sales Chart Component
 * Displays sales, revenue, and profit trends over time
 */

import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SalesData } from '@/types/dashboard';

interface SalesChartProps {
  data: SalesData[];
}

export function SalesChart({ data }: SalesChartProps) {
  const formatTooltip = (value: number) => [
    `$${value.toLocaleString()}`,
    "",
  ];

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Sales & Revenue Trends
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={formatTooltip} />
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
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
    </div>
  );
}
