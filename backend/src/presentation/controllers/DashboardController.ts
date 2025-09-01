/**
 * Dashboard Controller
 * Presentation layer controller for dashboard operations
 * Handles HTTP requests and responses following MVC pattern
 */

import { Request, Response } from 'express';
import { DashboardApplicationService } from '../../application/services/DashboardApplicationService';
import { ILogger } from '../../shared/types/ILogger';

/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard data and operations
 */
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardApplicationService,
    private readonly logger: ILogger
  ) {}

  /**
   * Get comprehensive dashboard data
   * GET /api/dashboard
   */
  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const { period } = req.query;
      
      this.logger.info('Dashboard data request received', {
        period,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      const dashboardData = await this.dashboardService.getDashboardData(period as string);

      this.logger.info('Dashboard data request completed successfully', {
        period,
        dataSize: JSON.stringify(dashboardData).length
      });

      res.status(200).json({
        success: true,
        data: dashboardData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get dashboard data', error as Error, {
        period: req.query.period,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Unable to retrieve dashboard data',
        code: 'DASHBOARD_DATA_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get dashboard metrics only
   * GET /api/dashboard/metrics
   */
  async getDashboardMetrics(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('Dashboard metrics request received', {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      const metrics = await this.dashboardService.getDashboardMetrics();

      this.logger.info('Dashboard metrics request completed successfully');

      res.status(200).json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get dashboard metrics', error as Error, {
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Unable to retrieve dashboard metrics',
        code: 'DASHBOARD_METRICS_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get sales analytics
   * GET /api/dashboard/sales
   */
  async getSalesAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period } = req.query;
      
      if (!period) {
        res.status(400).json({
          success: false,
          error: 'Period parameter is required',
          code: 'MISSING_PERIOD',
          timestamp: new Date().toISOString()
        });
        return;
      }

      this.logger.info('Sales analytics request received', {
        period,
        ip: req.ip
      });

      const salesAnalytics = await this.dashboardService.getSalesAnalytics(period as string);

      this.logger.info('Sales analytics request completed successfully', {
        period
      });

      res.status(200).json({
        success: true,
        data: salesAnalytics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get sales analytics', error as Error, {
        period: req.query.period,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Unable to retrieve sales analytics',
        code: 'SALES_ANALYTICS_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get customer analytics
   * GET /api/dashboard/customers
   */
  async getCustomerAnalytics(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('Customer analytics request received', {
        ip: req.ip
      });

      const customerAnalytics = await this.dashboardService.getCustomerAnalytics();

      this.logger.info('Customer analytics request completed successfully');

      res.status(200).json({
        success: true,
        data: customerAnalytics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get customer analytics', error as Error, {
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Unable to retrieve customer analytics',
        code: 'CUSTOMER_ANALYTICS_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get inventory analytics
   * GET /api/dashboard/inventory
   */
  async getInventoryAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { lowStockThreshold } = req.query;
      const threshold = lowStockThreshold ? parseInt(lowStockThreshold as string) : undefined;

      this.logger.info('Inventory analytics request received', {
        lowStockThreshold: threshold,
        ip: req.ip
      });

      const inventoryAnalytics = await this.dashboardService.getInventoryAnalytics(threshold);

      this.logger.info('Inventory analytics request completed successfully', {
        lowStockThreshold: threshold
      });

      res.status(200).json({
        success: true,
        data: inventoryAnalytics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get inventory analytics', error as Error, {
        lowStockThreshold: req.query.lowStockThreshold,
        ip: req.ip
      });

      res.status(500).json({
        success: false,
        error: 'Unable to retrieve inventory analytics',
        code: 'INVENTORY_ANALYTICS_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get dashboard health status
   * GET /api/dashboard/health
   */
  async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      this.logger.debug('Dashboard health status request received', {
        ip: req.ip
      });

      const healthStatus = await this.dashboardService.getHealthStatus();

      const statusCode = healthStatus.status === 'healthy' ? 200 :
                        healthStatus.status === 'degraded' ? 206 : 503;

      res.status(statusCode).json({
        success: healthStatus.status !== 'unhealthy',
        data: healthStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Failed to get dashboard health status', error as Error, {
        ip: req.ip
      });

      res.status(503).json({
        success: false,
        error: 'Unable to retrieve dashboard health status',
        code: 'DASHBOARD_HEALTH_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Validate request parameters (private helper)
   */
  private validatePeriodParameter(period: any): boolean {
    if (!period) return false;
    
    // Basic validation for period format (YYYY, YYYY-MM, etc.)
    const periodRegex = /^\d{4}(-\d{2})?(-\d{2})?$/;
    return periodRegex.test(period);
  }

  /**
   * Get request context for logging (private helper)
   */
  private getRequestContext(req: Request): any {
    return {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
  }
}
