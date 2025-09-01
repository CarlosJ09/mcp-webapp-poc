/**
 * Dashboard Use Cases
 * Application layer business logic for dashboard operations
 * Follows Single Responsibility Principle
 */

import { Dashboard } from '../../domain/entities/Dashboard';
import { IDashboardRepository } from '../../domain/interfaces/IRepositories';
import { ILogger } from '../../shared/types/ILogger';

/**
 * Get Dashboard Data Use Case
 * Handles the business logic for retrieving and preparing dashboard data
 */
export class GetDashboardDataUseCase {
  constructor(
    private readonly dashboardRepository: IDashboardRepository,
    private readonly logger: ILogger
  ) {}

  /**
   * Execute the use case
   * @param period - Time period for data filtering (optional)
   * @returns Dashboard entity with business rules applied
   */
  async execute(period?: string): Promise<Dashboard> {
    try {
      this.logger.info('Executing GetDashboardDataUseCase', { period });

      // Get dashboard data from repository
      const dashboard = await this.dashboardRepository.getDashboard(period);

      // Apply business rules
      const averageOrderValue = dashboard.getAverageOrderValue();
      const topCustomers = dashboard.getTopCustomers();
      const lowStockItems = dashboard.getLowStockItems();

      this.logger.info('Dashboard data retrieved successfully', {
        period,
        averageOrderValue,
        topCustomersCount: topCustomers.length,
        lowStockItemsCount: lowStockItems.length
      });

      return dashboard;
    } catch (error) {
      this.logger.error('Failed to get dashboard data', error as Error, { period });
      throw new Error('Unable to retrieve dashboard data');
    }
  }
}

/**
 * Get Dashboard Metrics Use Case
 * Focused responsibility for getting only metrics data
 */
export class GetDashboardMetricsUseCase {
  constructor(
    private readonly dashboardRepository: IDashboardRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<any> {
    try {
      this.logger.info('Executing GetDashboardMetricsUseCase');

      const metrics = await this.dashboardRepository.getDashboardMetrics();

      // Business rule: Ensure metrics are valid
      if (metrics.totalSales < 0 || metrics.totalRevenue < 0) {
        throw new Error('Invalid metrics data received');
      }

      this.logger.info('Dashboard metrics retrieved successfully', metrics);
      return {
        totalSales: metrics.totalSales,
        totalCustomers: metrics.totalCustomers,
        totalItems: metrics.totalItems,
        totalRevenue: metrics.totalRevenue,
        // Add calculated metrics
        averageOrderValue: metrics.totalSales > 0 ? metrics.totalRevenue / metrics.totalSales : 0
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard metrics', error as Error);
      throw new Error('Unable to retrieve dashboard metrics');
    }
  }
}

/**
 * Get Sales Analytics Use Case
 * Specialized for sales data analysis
 */
export class GetSalesAnalyticsUseCase {
  constructor(
    private readonly dashboardRepository: IDashboardRepository,
    private readonly logger: ILogger
  ) {}

  async execute(period: string): Promise<any> {
    try {
      this.logger.info('Executing GetSalesAnalyticsUseCase', { period });

      const salesData = await this.dashboardRepository.getSalesData(period);

      // Business rules for sales analytics
      const totalRevenue = salesData.reduce((sum, sale) => sum + sale.revenue, 0);
      const totalSales = salesData.reduce((sum, sale) => sum + sale.salesCount, 0);
      const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      // Find best and worst performing periods
      const bestPeriod = salesData.reduce((best, current) => 
        current.revenue > best.revenue ? current : best, salesData[0]
      );
      
      const worstPeriod = salesData.reduce((worst, current) => 
        current.revenue < worst.revenue ? current : worst, salesData[0]
      );

      const result = {
        period,
        salesData,
        analytics: {
          totalRevenue,
          totalSales,
          averageSaleValue,
          bestPerformingPeriod: bestPeriod,
          worstPerformingPeriod: worstPeriod
        }
      };

      this.logger.info('Sales analytics calculated successfully', {
        period,
        totalRevenue,
        totalSales,
        averageSaleValue
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get sales analytics', error as Error, { period });
      throw new Error('Unable to retrieve sales analytics');
    }
  }
}

/**
 * Get Customer Analytics Use Case
 * Specialized for customer data analysis
 */
export class GetCustomerAnalyticsUseCase {
  constructor(
    private readonly dashboardRepository: IDashboardRepository,
    private readonly logger: ILogger
  ) {}

  async execute(): Promise<any> {
    try {
      this.logger.info('Executing GetCustomerAnalyticsUseCase');

      const customers = await this.dashboardRepository.getCustomerData();

      // Business rules for customer analytics
      const totalCustomers = customers.length;
      const totalSpent = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
      const averageSpentPerCustomer = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

      // Customer segmentation (business rules)
      const highValueCustomers = customers.filter(c => c.totalSpent > averageSpentPerCustomer * 2);
      const mediumValueCustomers = customers.filter(c => 
        c.totalSpent > averageSpentPerCustomer && c.totalSpent <= averageSpentPerCustomer * 2
      );
      const lowValueCustomers = customers.filter(c => c.totalSpent <= averageSpentPerCustomer);

      const result = {
        customers,
        analytics: {
          totalCustomers,
          totalSpent,
          averageSpentPerCustomer,
          segmentation: {
            highValue: {
              count: highValueCustomers.length,
              percentage: (highValueCustomers.length / totalCustomers) * 100,
              customers: highValueCustomers.slice(0, 5) // Top 5
            },
            mediumValue: {
              count: mediumValueCustomers.length,
              percentage: (mediumValueCustomers.length / totalCustomers) * 100
            },
            lowValue: {
              count: lowValueCustomers.length,
              percentage: (lowValueCustomers.length / totalCustomers) * 100
            }
          }
        }
      };

      this.logger.info('Customer analytics calculated successfully', {
        totalCustomers,
        averageSpentPerCustomer,
        highValueCount: highValueCustomers.length
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get customer analytics', error as Error);
      throw new Error('Unable to retrieve customer analytics');
    }
  }
}

/**
 * Get Inventory Analytics Use Case
 * Specialized for inventory analysis
 */
export class GetInventoryAnalyticsUseCase {
  constructor(
    private readonly dashboardRepository: IDashboardRepository,
    private readonly logger: ILogger
  ) {}

  async execute(lowStockThreshold: number = 10): Promise<any> {
    try {
      this.logger.info('Executing GetInventoryAnalyticsUseCase', { lowStockThreshold });

      const inventory = await this.dashboardRepository.getInventoryData();

      // Business rules for inventory analytics
      const totalItems = inventory.length;
      const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
      const averageStockPerItem = totalItems > 0 ? totalStock / totalItems : 0;

      // Stock analysis
      const lowStockItems = inventory.filter(item => item.stock <= lowStockThreshold);
      const outOfStockItems = inventory.filter(item => item.stock === 0);
      const wellStockedItems = inventory.filter(item => item.stock > lowStockThreshold);

      // Category analysis
      const categoryStats = inventory.reduce((stats, item) => {
        if (!stats[item.category]) {
          stats[item.category] = { count: 0, totalStock: 0 };
        }
        stats[item.category].count++;
        stats[item.category].totalStock += item.stock;
        return stats;
      }, {} as Record<string, { count: number; totalStock: number }>);

      const result = {
        inventory,
        analytics: {
          totalItems,
          totalStock,
          averageStockPerItem,
          stockStatus: {
            lowStock: {
              count: lowStockItems.length,
              items: lowStockItems,
              percentage: (lowStockItems.length / totalItems) * 100
            },
            outOfStock: {
              count: outOfStockItems.length,
              items: outOfStockItems,
              percentage: (outOfStockItems.length / totalItems) * 100
            },
            wellStocked: {
              count: wellStockedItems.length,
              percentage: (wellStockedItems.length / totalItems) * 100
            }
          },
          categoryStats
        }
      };

      this.logger.info('Inventory analytics calculated successfully', {
        totalItems,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get inventory analytics', error as Error, { lowStockThreshold });
      throw new Error('Unable to retrieve inventory analytics');
    }
  }
}
