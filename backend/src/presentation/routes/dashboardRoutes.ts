/**
 * Dashboard Routes
 * Presentation layer routing for dashboard endpoints
 * Follows RESTful API design principles
 */

import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { container } from '../../shared/container/Container';

/**
 * Create dashboard routes
 */
export function createDashboardRoutes(): Router {
  const router = Router();
  
  // Get dashboard controller from dependency injection container
  const dashboardController = container.get<DashboardController>('dashboardController');

  /**
   * @route GET /api/dashboard
   * @desc Get comprehensive dashboard data
   * @access Public
   * @query period - Optional time period filter
   */
  router.get('/', (req, res) => dashboardController.getDashboardData(req, res));

  /**
   * @route GET /api/dashboard/metrics
   * @desc Get dashboard metrics only
   * @access Public
   */
  router.get('/metrics', (req, res) => dashboardController.getDashboardMetrics(req, res));

  /**
   * @route GET /api/dashboard/sales
   * @desc Get sales analytics
   * @access Public
   * @query period - Required time period for sales data
   */
  router.get('/sales', (req, res) => dashboardController.getSalesAnalytics(req, res));

  /**
   * @route GET /api/dashboard/customers
   * @desc Get customer analytics
   * @access Public
   */
  router.get('/customers', (req, res) => dashboardController.getCustomerAnalytics(req, res));

  /**
   * @route GET /api/dashboard/inventory
   * @desc Get inventory analytics
   * @access Public
   * @query lowStockThreshold - Optional threshold for low stock items
   */
  router.get('/inventory', (req, res) => dashboardController.getInventoryAnalytics(req, res));

  /**
   * @route GET /api/dashboard/health
   * @desc Get dashboard service health status
   * @access Public
   */
  router.get('/health', (req, res) => dashboardController.getHealthStatus(req, res));

  return router;
}
