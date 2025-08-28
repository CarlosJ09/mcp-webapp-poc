/**
 * KPI Cards Component
 * Displays key performance indicators in card format
 */

import type { KPIMetrics } from "@/types/dashboard";
import { formatCurrency, formatNumber } from "@/utils/format";

interface KPICardsProps {
  metrics: KPIMetrics;
}

export function KPICards({ metrics }: KPICardsProps) {
  const cards = [
    {
      title: "Total Sales",
      value: formatCurrency(metrics.totalSales),
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Customers",
      value: formatNumber(metrics.totalCustomers),
      gradient: "from-green-500 to-green-600",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.totalRevenue ?? 0),
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: "Total Items",
      value: formatCurrency(metrics.totalItems),
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
