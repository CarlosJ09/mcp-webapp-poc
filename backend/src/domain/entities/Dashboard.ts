/**
 * Dashboard Domain Entity
 * Represents the core dashboard business entity with its rules and behaviors
 */

export interface DashboardMetrics {
  readonly totalSales: number;
  readonly totalCustomers: number;
  readonly totalItems: number;
  readonly totalRevenue: number;
}

export interface SalesData {
  readonly period: string;
  readonly salesCount: number;
  readonly revenue: number;
}

export interface CustomerData {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly totalSpent: number;
}

export interface InventoryItem {
  readonly id: string;
  readonly name: string;
  readonly stock: number;
  readonly category: string;
}

/**
 * Dashboard Domain Entity
 * Contains business logic for dashboard data validation and calculations
 */
export class Dashboard {
  private readonly _metrics: DashboardMetrics;
  private readonly _salesData: SalesData[];
  private readonly _customers: CustomerData[];
  private readonly _inventory: InventoryItem[];

  constructor(
    metrics: DashboardMetrics,
    salesData: SalesData[],
    customers: CustomerData[],
    inventory: InventoryItem[]
  ) {
    this.validateMetrics(metrics);
    this.validateSalesData(salesData);
    this.validateCustomers(customers);
    this.validateInventory(inventory);

    this._metrics = metrics;
    this._salesData = salesData;
    this._customers = customers;
    this._inventory = inventory;
  }

  // Getters (following immutability principle)
  get metrics(): DashboardMetrics {
    return { ...this._metrics };
  }

  get salesData(): SalesData[] {
    return [...this._salesData];
  }

  get customers(): CustomerData[] {
    return [...this._customers];
  }

  get inventory(): InventoryItem[] {
    return [...this._inventory];
  }

  /**
   * Business rule: Calculate average order value
   */
  getAverageOrderValue(): number {
    if (this._metrics.totalSales === 0) return 0;
    return this._metrics.totalRevenue / this._metrics.totalSales;
  }

  /**
   * Business rule: Get top performing customers
   */
  getTopCustomers(limit: number = 5): CustomerData[] {
    return [...this._customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  }

  /**
   * Business rule: Get low stock items
   */
  getLowStockItems(threshold: number = 10): InventoryItem[] {
    return this._inventory.filter(item => item.stock <= threshold);
  }

  /**
   * Business rule: Calculate total inventory value (requires external pricing data)
   */
  getTotalInventoryCount(): number {
    return this._inventory.reduce((total, item) => total + item.stock, 0);
  }

  /**
   * Private validation methods (business rule validation)
   */
  private validateMetrics(metrics: DashboardMetrics): void {
    if (metrics.totalSales < 0 || metrics.totalCustomers < 0 || 
        metrics.totalItems < 0 || metrics.totalRevenue < 0) {
      throw new Error('Dashboard metrics cannot be negative');
    }
  }

  private validateSalesData(salesData: SalesData[]): void {
    salesData.forEach(data => {
      if (data.salesCount < 0 || data.revenue < 0) {
        throw new Error('Sales data values cannot be negative');
      }
    });
  }

  private validateCustomers(customers: CustomerData[]): void {
    customers.forEach(customer => {
      if (!customer.id || !customer.name || !customer.email) {
        throw new Error('Customer must have valid id, name, and email');
      }
      if (customer.totalSpent < 0) {
        throw new Error('Customer total spent cannot be negative');
      }
    });
  }

  private validateInventory(inventory: InventoryItem[]): void {
    inventory.forEach(item => {
      if (!item.id || !item.name || !item.category) {
        throw new Error('Inventory item must have valid id, name, and category');
      }
      if (item.stock < 0) {
        throw new Error('Inventory stock cannot be negative');
      }
    });
  }
}
