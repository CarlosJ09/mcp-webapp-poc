/**
 * Dashboard-related TypeScript interfaces and types
 * Centralized type definitions for better maintainability
 */

export interface SalesData {
  month: string;
  sales: number;
  revenue: number;
  profit: number;
}

export interface UserAnalytics {
  demographics: DemographicData[];
  engagement: EngagementData[];
}

export interface DemographicData {
  age: string;
  users: number;
}

export interface EngagementData {
  day: string;
  activeUsers: number;
  sessions: number;
}

export interface PerformanceData {
  hour: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
}

export interface RevenueData {
  source: string;
  value: number;
  color: string;
}

export interface KPIMetrics {
  totalRevenue: number;
  totalUsers: number;
  avgResponseTime: number;
  totalProfit: number;
}

export interface DashboardState {
  salesData: SalesData[];
  userAnalytics: UserAnalytics | null;
  performanceData: PerformanceData[];
  revenueData: RevenueData[];
  loading: boolean;
  error: string | null;
}
