/**
 * @fileoverview Domain interfaces for external API services
 * Following SOLID principles - Interface Segregation & Dependency Inversion
 */

/**
 * API response wrapper interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * External API service interface - Dependency Inversion Principle
 * This allows us to depend on abstractions, not concretions
 */
export interface IExternalApiService {
  /**
   * Fetch sales data
   */
  getSalesData(): Promise<ApiResponse>;

  /**
   * Fetch customers data
   */
  getCustomersData(): Promise<ApiResponse>;

  /**
   * Fetch dashboard metrics
   */
  getDashboardMetrics(): Promise<ApiResponse>;

  /**
   * Fetch items/inventory data
   */
  getItemsData(): Promise<ApiResponse>;

  /**
   * Fetch sales summary with period filter
   */
  getSalesSummary(period: string): Promise<ApiResponse>;

  /**
   * Fetch customer analytics
   */
  getCustomerAnalytics(): Promise<ApiResponse>;

  /**
   * Fetch inventory status
   */
  getInventoryStatus(): Promise<ApiResponse>;

  /**
   * Health check for external API
   */
  healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>>;
}

/**
 * Logger interface - Interface Segregation Principle
 */
export interface ILogger {
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, error?: Error, data?: any): void;
  debug(message: string, data?: any): void;
}

/**
 * MCP Server Transport interface
 */
export interface IMCPTransport {
  sessionId?: string;
  handleRequest(req: any, res: any, body?: any): Promise<void>;
  onclose?: () => void;
}

/**
 * MCP Server interface
 */
export interface IMCPServer {
  connect(transport: IMCPTransport): Promise<void>;
}
