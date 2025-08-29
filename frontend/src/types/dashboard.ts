/**
 * Dashboard-related TypeScript interfaces and types
 * Centralized type definitions for better maintainability
 */

export enum Period {
  MONTHLY = "monthly",
  WEEKLY = "weekly",
  DAILY = "daily",
}

export interface Sale {
  id: string;
  customer_id: string;
  date: string;
  total: string;
  created_at?: string;
  customer: Partial<Customer>;
  payments: Payment[];
  saleDetails: SaleDetail[];
}

export interface SaleDetail {
  id: string;
  item_id: string;
  quantity: string;
  price: number;
  item: { name: string };
}

export interface SalesMetrics {
  period: Period;
  totalSales: number;
  totalRevenue: number | null;
  salesByPeriod: {
    period: string; // YYYY-MM
    salesCount: number;
    revenue: number | null;
  }[];
}

export interface Payment {
  id: string;
  type: string;
  amount: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  averageCustomerValue: number | null;
  customerDistribution: { range: string; count: number }[];
}

export interface Item {
  id: string;
  name: string;
  price: string;
  stock: number;
  created_at: string;
}

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

export interface DashboardMetricsData {
  totalSales: number;
  totalRevenue?: number;
  totalCustomers: number;
  totalItems: number;
  averageOrderValue?: number;
  topSellingItems: {
    itemId: string;
    itemName: string;
    totalSold: number;
  }[];
  topCustomers: {
    customerId: string;
    customerName: string;
    totalSpent: number;
  }[];
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

export interface KPIMetrics {
  totalSales: number;
  totalCustomers: number;
  totalItems: number;
  totalRevenue?: number;
}

export interface DashboardState {
  salesData: Sale[];
  customersData: Customer[];
  dashboardMetricsData: DashboardMetricsData;
  salesMetricsData: SalesMetrics;
  customersMetricsData: CustomerMetrics;
  inventoryMetricsData: InventoryMetricsData;
  itemsData: Item[];
  loading: boolean;
  error: string | null;
}
