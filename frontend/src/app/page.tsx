"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { mcpClient, safeMCP } from "../lib/mcp-client";

interface SalesData {
  month: string;
  sales: number;
  revenue: number;
  profit: number;
}

interface UserAnalytics {
  demographics: { age: string; users: number }[];
  engagement: { day: string; activeUsers: number; sessions: number }[];
}

interface PerformanceData {
  hour: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
}

interface RevenueData {
  source: string;
  value: number;
  color: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard data state
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(
    null
  );
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);

  // Initialize MCP connection and load dashboard data
  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      try {
        // Initialize MCP connection
        const { error: initError } = await safeMCP(async () => {
          return await mcpClient.initialize();
        });

        if (initError) {
          setError(initError);
          setLoading(false);
          return;
        }

        // Load all dashboard data in parallel
        const [salesResult, analyticsResult, performanceResult, revenueResult] =
          await Promise.all([
            safeMCP(() => mcpClient.readResource("sales://monthly")),
            safeMCP(() => mcpClient.readResource("analytics://users")),
            safeMCP(() => mcpClient.readResource("metrics://performance")),
            safeMCP(() => mcpClient.readResource("revenue://breakdown")),
          ]);

        // Process sales data
        if (salesResult.data) {
          const salesContent = JSON.parse(salesResult.data.contents[0].text);
          setSalesData(salesContent);
        }

        // Process user analytics
        if (analyticsResult.data) {
          const analyticsContent = JSON.parse(
            analyticsResult.data.contents[0].text
          );
          setUserAnalytics(analyticsContent);
        }

        // Process performance data
        if (performanceResult.data) {
          const performanceContent = JSON.parse(
            performanceResult.data.contents[0].text
          );
          setPerformanceData(performanceContent);
        }

        // Process revenue data
        if (revenueResult.data) {
          const revenueContent = JSON.parse(
            revenueResult.data.contents[0].text
          );
          setRevenueData(revenueContent);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    // Reload all data
    const [salesResult, analyticsResult, performanceResult, revenueResult] =
      await Promise.all([
        safeMCP(() => mcpClient.readResource("sales://monthly")),
        safeMCP(() => mcpClient.readResource("analytics://users")),
        safeMCP(() => mcpClient.readResource("metrics://performance")),
        safeMCP(() => mcpClient.readResource("revenue://breakdown")),
      ]);

    if (salesResult.data)
      setSalesData(JSON.parse(salesResult.data.contents[0].text));
    if (analyticsResult.data)
      setUserAnalytics(JSON.parse(analyticsResult.data.contents[0].text));
    if (performanceResult.data)
      setPerformanceData(JSON.parse(performanceResult.data.contents[0].text));
    if (revenueResult.data)
      setRevenueData(JSON.parse(revenueResult.data.contents[0].text));

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              📊 MCP Analytics Dashboard
            </h1>
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Refresh Data
              </button>
              {error && (
                <div className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm">
                  Connection Error
                </div>
              )}
              {!error && (
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                  ✅ MCP Connected
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* KPI Cards */}
          <div className="xl:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4">
              <div className="text-sm opacity-80">Total Revenue</div>
              <div className="text-2xl font-bold">
                $
                {salesData
                  .reduce((sum, item) => sum + item.revenue, 0)
                  .toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4">
              <div className="text-sm opacity-80">Total Users</div>
              <div className="text-2xl font-bold">
                {userAnalytics?.demographics
                  .reduce((sum, item) => sum + item.users, 0)
                  .toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4">
              <div className="text-sm opacity-80">Avg Response Time</div>
              <div className="text-2xl font-bold">
                {Math.round(
                  performanceData.reduce(
                    (sum, item) => sum + item.responseTime,
                    0
                  ) / performanceData.length
                )}
                ms
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4">
              <div className="text-sm opacity-80">Total Profit</div>
              <div className="text-2xl font-bold">
                $
                {salesData
                  .reduce((sum, item) => sum + item.profit, 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>

          {/* Sales Trends */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📈 Sales & Revenue Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    "",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#82ca9d"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#ffc658"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              💰 Revenue Sources
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ source, value }) =>
                    `${source}: $${(value ? value / 1000 : 0).toFixed(0)}K`
                  }
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* User Demographics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              👥 User Demographics
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userAnalytics?.demographics || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* User Engagement */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📱 Daily Engagement
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={userAnalytics?.engagement || []}>
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
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stackId="2"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              ⚡ Performance Metrics
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData.slice(0, 12)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#ff7300"
                  name="Response Time (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Real-time Sales */}
          {realtimeData.length > 0 && (
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                🔴 Real-time Sales
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={realtimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleTimeString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleTimeString()
                    }
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "Sales",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00ff88"
                    fill="#00ff88"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
