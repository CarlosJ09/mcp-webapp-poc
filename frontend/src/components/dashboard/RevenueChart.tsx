/**
 * Revenue Chart Component
 * Displays revenue breakdown by source in a pie chart
 */

import { DollarSign } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueData } from '@/types/dashboard';

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatLabel = ({ source, value }: RevenueData) =>
    `${source}: $${(value ? value / 1000 : 0).toFixed(0)}K`;

  const formatTooltip = (value: number) => `$${value.toLocaleString()}`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <DollarSign className="h-5 w-5" />
        Revenue Sources
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={formatLabel}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={formatTooltip} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
