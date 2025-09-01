/**
 * Domain Repository Interfaces
 * Define contracts for data access following Dependency Inversion Principle
 */

import { Dashboard, DashboardMetrics, SalesData, CustomerData, InventoryItem } from '../entities/Dashboard';

/**
 * Dashboard Repository Interface
 * Defines contract for dashboard data access
 */
export interface IDashboardRepository {
  /**
   * Get dashboard metrics
   */
  getDashboardMetrics(): Promise<DashboardMetrics>;

  /**
   * Get sales data for specific period
   */
  getSalesData(period: string): Promise<SalesData[]>;

  /**
   * Get customer data
   */
  getCustomerData(): Promise<CustomerData[]>;

  /**
   * Get inventory data
   */
  getInventoryData(): Promise<InventoryItem[]>;

  /**
   * Get complete dashboard entity
   */
  getDashboard(period?: string): Promise<Dashboard>;
}

/**
 * External Data Service Interface
 * Defines contract for external API integrations
 */
export interface IExternalDataService {
  /**
   * Fetch data from external API
   */
  fetchData(endpoint: string, params?: Record<string, any>): Promise<any>;

  /**
   * Check if external service is healthy
   */
  healthCheck(): Promise<boolean>;

  /**
   * Get service configuration
   */
  getConfiguration(): {
    baseUrl: string;
    timeout: number;
    retryCount: number;
  };
}
