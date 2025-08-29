/**
 * Period Selector Component
 * Allows users to select different time periods for sales data
 */

import { Calendar } from "lucide-react";
import { Period } from "@/types/dashboard";

interface PeriodSelectorProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
  loading?: boolean;
}

export function PeriodSelector({
  selectedPeriod,
  onPeriodChange,
  loading = false,
}: PeriodSelectorProps) {
  const periods = [
    { value: Period.DAILY, label: "Daily" },
    { value: Period.WEEKLY, label: "Weekly" },
    { value: Period.MONTHLY, label: "Monthly" },
  ];

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-gray-500" />
      <span className="text-sm font-medium text-gray-700">Period:</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value)}
            disabled={loading}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
              selectedPeriod === period.value
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
}
