/**
 * KPI Cards Component
 * Displays key performance indicators in card format
 */

import type { KPIMetrics } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatResponseTime } from '@/utils/calculations';

interface KPICardsProps {
  metrics: KPIMetrics;
}

export function KPICards({ metrics }: KPICardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.totalRevenue),
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Users",
      value: formatNumber(metrics.totalUsers),
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Avg Response Time",
      value: formatResponseTime(metrics.avgResponseTime),
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Total Profit",
      value: formatCurrency(metrics.totalProfit),
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="xl:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${card.gradient} text-white rounded-xl p-4`}
        >
          <div className="text-sm opacity-80">{card.title}</div>
          <div className="text-2xl font-bold">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
