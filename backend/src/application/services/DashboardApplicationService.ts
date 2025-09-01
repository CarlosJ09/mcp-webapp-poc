/**
 * Application Services
 * Orchestrate use cases and provide higher-level business operations
 * Follows Single Responsibility and Open/Closed principles
 */

import { 
  GetDashboardDataUseCase,
  GetDashboardMetricsUseCase,
  GetSalesAnalyticsUseCase,
  GetCustomerAnalyticsUseCase,
  GetInventoryAnalyticsUseCase
} from '../use-cases/DashboardUseCases';
import { ILogger } from '../../shared/types/ILogger';

/**
 * Dashboard Application Service
 * Coordinates dashboard-related operations
 */
export class DashboardApplicationService {
  constructor(
    private readonly getDashboardDataUseCase: GetDashboardDataUseCase,
    private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase,
    private readonly getSalesAnalyticsUseCase: GetSalesAnalyticsUseCase,
    private readonly getCustomerAnalyticsUseCase: GetCustomerAnalyticsUseCase,
    private readonly getInventoryAnalyticsUseCase: GetInventoryAnalyticsUseCase,
    private readonly logger: ILogger
  ) {}

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(period?: string): Promise<any> {
    try {
      this.logger.info('Getting comprehensive dashboard data', { period });

      // Execute use cases in parallel for better performance
      const [
        dashboardData,
        metrics,
        salesAnalytics,
        customerAnalytics,
        inventoryAnalytics
      ] = await Promise.all([
        this.getDashboardDataUseCase.execute(period),
        this.getDashboardMetricsUseCase.execute(),
        period ? this.getSalesAnalyticsUseCase.execute(period) : null,
        this.getCustomerAnalyticsUseCase.execute(),
        this.getInventoryAnalyticsUseCase.execute()
      ]);

      const result = {
        dashboard: {
          metrics,
          overview: {
            averageOrderValue: dashboardData.getAverageOrderValue(),
            topCustomers: dashboardData.getTopCustomers(),
            lowStockItems: dashboardData.getLowStockItems(),
            totalInventoryCount: dashboardData.getTotalInventoryCount()
          }
        },
        analytics: {
          sales: salesAnalytics,
          customers: customerAnalytics,
          inventory: inventoryAnalytics
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          period: period || 'all-time',
          dataPoints: {
            customers: customerAnalytics.analytics.totalCustomers,
            inventoryItems: inventoryAnalytics.analytics.totalItems
          }
        }
      };

      this.logger.info('Dashboard data compiled successfully', {
        period,
        customerCount: customerAnalytics.analytics.totalCustomers,
        inventoryCount: inventoryAnalytics.analytics.totalItems
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get comprehensive dashboard data', error as Error, { period });
      throw error;
    }
  }

  /**
   * Get only dashboard metrics (lightweight operation)
   */
  async getDashboardMetrics(): Promise<any> {
    try {
      return await this.getDashboardMetricsUseCase.execute();
    } catch (error) {
      this.logger.error('Failed to get dashboard metrics', error as Error);
      throw error;
    }
  }

  /**
   * Get sales analytics for specific period
   */
  async getSalesAnalytics(period: string): Promise<any> {
    try {
      return await this.getSalesAnalyticsUseCase.execute(period);
    } catch (error) {
      this.logger.error('Failed to get sales analytics', error as Error, { period });
      throw error;
    }
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(): Promise<any> {
    try {
      return await this.getCustomerAnalyticsUseCase.execute();
    } catch (error) {
      this.logger.error('Failed to get customer analytics', error as Error);
      throw error;
    }
  }

  /**
   * Get inventory analytics
   */
  async getInventoryAnalytics(lowStockThreshold?: number): Promise<any> {
    try {
      return await this.getInventoryAnalyticsUseCase.execute(lowStockThreshold);
    } catch (error) {
      this.logger.error('Failed to get inventory analytics', error as Error, { lowStockThreshold });
      throw error;
    }
  }

  /**
   * Get dashboard health status
   */
  async getHealthStatus(): Promise<any> {
    try {
      this.logger.debug('Checking dashboard health status');

      // Basic health checks
      const [metrics, customerAnalytics, inventoryAnalytics] = await Promise.all([
        this.getDashboardMetricsUseCase.execute().catch(() => null),
        this.getCustomerAnalyticsUseCase.execute().catch(() => null),
        this.getInventoryAnalyticsUseCase.execute().catch(() => null)
      ]);

      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          metrics: metrics !== null ? 'operational' : 'degraded',
          customerAnalytics: customerAnalytics !== null ? 'operational' : 'degraded',
          inventoryAnalytics: inventoryAnalytics !== null ? 'operational' : 'degraded'
        },
        dataQuality: {
          metricsAvailable: metrics !== null,
          customersAvailable: customerAnalytics !== null,
          inventoryAvailable: inventoryAnalytics !== null
        }
      };

      // Determine overall health
      const degradedServices = Object.values(healthStatus.services).filter(s => s === 'degraded').length;
      if (degradedServices > 0) {
        healthStatus.status = degradedServices === 3 ? 'unhealthy' : 'degraded';
      }

      this.logger.info('Dashboard health status checked', {
        status: healthStatus.status,
        degradedServices
      });

      return healthStatus;
    } catch (error) {
      this.logger.error('Failed to check dashboard health status', error as Error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: (error as Error).message
      };
    }
  }
}
