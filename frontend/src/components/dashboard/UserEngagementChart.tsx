/**
 * User Engagement Chart Component
 * Displays daily user engagement metrics
 */

import { Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { EngagementData } from '@/types/dashboard';

interface UserEngagementChartProps {
  data: EngagementData[];
}

export function UserEngagementChart({ data }: UserEngagementChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <Activity className="h-5 w-5" />
        Daily Engagement
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="activeUsers"
            stackId="1"
            stroke="#8884d8"
            fill="#8884d8"
            name="Active Users"
          />
          <Area
            type="monotone"
            dataKey="sessions"
            stackId="2"
            stroke="#82ca9d"
            fill="#82ca9d"
            name="Sessions"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
