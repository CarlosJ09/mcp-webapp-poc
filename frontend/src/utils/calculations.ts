/**
 * Utility functions for dashboard calculations
 * Separated calculation logic for better testability and reusability
 */

import type { SalesData, PerformanceData, UserAnalytics, KPIMetrics } from '@/types/dashboard';

/**
 * Calculate KPI metrics from dashboard data
 */
export function calculateKPIs(
  salesData: SalesData[],
  userAnalytics: UserAnalytics | null,
  performanceData: PerformanceData[]
): KPIMetrics {
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = salesData.reduce((sum, item) => sum + item.profit, 0);
  const totalUsers = userAnalytics?.demographics.reduce((sum, item) => sum + item.users, 0) || 0;
  
  const avgResponseTime = performanceData.length > 0
    ? Math.round(
        performanceData.reduce((sum, item) => sum + item.responseTime, 0) / performanceData.length
      )
    : 0;

  return {
    totalRevenue,
    totalUsers,
    avgResponseTime,
    totalProfit,
  };
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

/**
 * Format number with locale
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Format response time with unit
 */
export function formatResponseTime(value: number): string {
  return `${value}ms`;
}
