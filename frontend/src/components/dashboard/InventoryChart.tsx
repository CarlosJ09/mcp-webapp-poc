/**
 * Inventory Status Chart Component
 * Displays inventory distribution and low stock items
 */

import { Package, AlertTriangle, TrendingDown } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export interface InventoryMetricsData {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalInventoryValue: number;
  lowStockList: {
    id: string;
    name: string;
    stock: number;
    price: number;
  }[];
}

interface InventoryChartProps {
  data: InventoryMetricsData;
}

const COLORS = {
  inStock: "#10B981", // Green
  lowStock: "#F59E0B", // Amber
  outOfStock: "#EF4444", // Red
};

export function InventoryChart({ data }: InventoryChartProps) {
  const inStockItems =
    data.totalItems - data.lowStockItems - data.outOfStockItems;

  const stockDistribution = [
    {
      name: "In Stock",
      value: inStockItems,
      color: COLORS.inStock,
      icon: Package,
    },
    {
      name: "Low Stock",
      value: data.lowStockItems,
      color: COLORS.lowStock,
      icon: AlertTriangle,
    },
    {
      name: "Out of Stock",
      value: data.outOfStockItems,
      color: COLORS.outOfStock,
      icon: TrendingDown,
    },
  ];

  const topLowStockItems = data.lowStockList.slice(0, 5).map((item) => ({
    name:
      item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name,
    fullName: item.name,
    stock: item.stock,
    value: item.price * item.stock, // Total value of remaining stock
  }));

  const formatTooltip = (value: number, name: string) => {
    if (name === "stock") {
      return [`${value} units`, "Stock Level"];
    }
    return [`$${value.toLocaleString()}`, "Stock Value"];
  };

  const formatPieTooltip = (value: number, name: string) => [
    `${value} items`,
    name,
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <Package className="h-5 w-5" />
        Inventory Status
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Distribution Donut Chart */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">
            Stock Distribution
          </h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stockDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {stockDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={formatPieTooltip} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center text showing total items */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {data.totalItems}
                </div>
                <div className="text-sm text-gray-500">Total Items</div>
              </div>
            </div>
          </div>

          {/* Legend with icons and percentages */}
          <div className="space-y-2">
            {stockDistribution.map((item) => {
              const percentage =
                data.totalItems > 0
                  ? ((item.value / data.totalItems) * 100).toFixed(1)
                  : 0;
              const IconComponent = item.icon;

              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <IconComponent className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.value}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Items Bar Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-700">
              Low Stock Items
            </h3>
            <span className="text-sm text-gray-500">Top 5</span>
          </div>

          {topLowStockItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topLowStockItems} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={formatTooltip}
                  labelFormatter={(label) => {
                    const item = topLowStockItems.find((i) => i.name === label);
                    return item?.fullName || label;
                  }}
                />
                <Bar
                  dataKey="stock"
                  fill={COLORS.lowStock}
                  radius={[0, 4, 4, 0]}
                  name="stock"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No low stock items</p>
              </div>
            </div>
          )}

          {/* Inventory Value Summary */}
          <div className="bg-gray-50 rounded-lg p-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Total Inventory Value
              </span>
              <span className="text-lg font-semibold text-green-600">
                ${data.totalInventoryValue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
