/**
 * Dashboard Repository Implementation
 * Infrastructure layer implementation of dashboard data access
 * Follows Dependency Inversion Principle
 */

import { 
  IDashboardRepository, 
  IExternalDataService 
} from '../../domain/interfaces/IRepositories';
import { 
  Dashboard, 
  DashboardMetrics, 
  SalesData, 
  CustomerData, 
  InventoryItem 
} from '../../domain/entities/Dashboard';
import { ILogger } from '../../shared/types/ILogger';

/**
 * Dashboard Repository Implementation
 * Handles data access and aggregation from external services
 */
export class DashboardRepository implements IDashboardRepository {
  constructor(
    private readonly externalDataService: IExternalDataService,
    private readonly logger: ILogger
  ) {}

  /**
   * Get dashboard metrics from external API
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      this.logger.debug('Fetching dashboard metrics');

      const response = await this.externalDataService.fetchData('/dashboard/metrics');
      
      // Transform external API response to domain model
      const metrics: DashboardMetrics = {
        totalSales: response.total_sales || 0,
        totalCustomers: response.total_customers || 0,
        totalItems: response.total_items || 0,
        totalRevenue: response.total_revenue || 0
      };

      this.logger.debug('Dashboard metrics fetched successfully', metrics);
      return metrics;
    } catch (error) {
      this.logger.error('Failed to fetch dashboard metrics', error as Error);
      throw new Error('Unable to retrieve dashboard metrics from external service');
    }
  }

  /**
   * Get sales data for specific period
   */
  async getSalesData(period: string): Promise<SalesData[]> {
    try {
      this.logger.debug('Fetching sales data', { period });

      const response = await this.externalDataService.fetchData('/sales/analytics', {
        period,
        groupBy: 'month'
      });

      // Transform to domain model
      const salesData: SalesData[] = (response.sales_by_period || []).map((item: any) => ({
        period: item.period,
        salesCount: item.sales_count || 0,
        revenue: item.revenue || 0
      }));

      this.logger.debug('Sales data fetched successfully', {
        period,
        recordCount: salesData.length
      });

      return salesData;
    } catch (error) {
      this.logger.error('Failed to fetch sales data', error as Error, { period });
      throw new Error('Unable to retrieve sales data from external service');
    }
  }

  /**
   * Get customer data with aggregated spending
   */
  async getCustomerData(): Promise<CustomerData[]> {
    try {
      this.logger.debug('Fetching customer data');

      const response = await this.externalDataService.fetchData('/customers/analytics');

      // Transform to domain model
      const customers: CustomerData[] = (response.customers || []).map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalSpent: customer.total_spent || 0
      }));

      this.logger.debug('Customer data fetched successfully', {
        customerCount: customers.length
      });

      return customers;
    } catch (error) {
      this.logger.error('Failed to fetch customer data', error as Error);
      throw new Error('Unable to retrieve customer data from external service');
    }
  }

  /**
   * Get inventory data
   */
  async getInventoryData(): Promise<InventoryItem[]> {
    try {
      this.logger.debug('Fetching inventory data');

      const response = await this.externalDataService.fetchData('/inventory');

      // Transform to domain model
      const inventory: InventoryItem[] = (response.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        stock: item.stock || 0,
        category: item.category || 'uncategorized'
      }));

      this.logger.debug('Inventory data fetched successfully', {
        itemCount: inventory.length
      });

      return inventory;
    } catch (error) {
      this.logger.error('Failed to fetch inventory data', error as Error);
      throw new Error('Unable to retrieve inventory data from external service');
    }
  }

  /**
   * Get complete dashboard entity with all data
   */
  async getDashboard(period?: string): Promise<Dashboard> {
    try {
      this.logger.info('Fetching complete dashboard data', { period });

      // Fetch all data in parallel for better performance
      const [metrics, salesData, customers, inventory] = await Promise.all([
        this.getDashboardMetrics(),
        period ? this.getSalesData(period) : this.getDefaultSalesData(),
        this.getCustomerData(),
        this.getInventoryData()
      ]);

      // Create dashboard entity (will validate data)
      const dashboard = new Dashboard(metrics, salesData, customers, inventory);

      this.logger.info('Complete dashboard data assembled', {
        period,
        metricsValid: true,
        salesRecords: salesData.length,
        customerCount: customers.length,
        inventoryCount: inventory.length
      });

      return dashboard;
    } catch (error) {
      this.logger.error('Failed to assemble complete dashboard data', error as Error, { period });
      throw error;
    }
  }

  /**
   * Get default sales data when no period is specified
   */
  private async getDefaultSalesData(): Promise<SalesData[]> {
    try {
      // Default to monthly data for current year
      const currentYear = new Date().getFullYear();
      const period = `${currentYear}`;
      return await this.getSalesData(period);
    } catch (error) {
      this.logger.warn('Failed to get default sales data, returning empty array', error as Error);
      return [];
    }
  }
}
