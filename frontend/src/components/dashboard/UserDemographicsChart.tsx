/**
 * User Demographics Chart Component
 * Displays user distribution by age groups
 */

import { Users } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DemographicData } from '@/types/dashboard';

interface UserDemographicsChartProps {
  data: DemographicData[];
}

export function UserDemographicsChart({ data }: UserDemographicsChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <Users className="h-5 w-5" />
        User Demographics
      </h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="users" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
