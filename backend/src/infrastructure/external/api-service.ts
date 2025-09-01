/**
 * @fileoverview External API service for data fetching
 * Provides abstraction layer for external data sources
 */

import * as https from 'https';
import { config } from '../../shared/config/app';
import { createLogger } from '../../shared/config/logger';

const logger = createLogger('External-API');

/**
 * API response wrapper interface
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * External API service class
 */
export class ExternalApiService {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(baseUrl?: string, timeout = 30000) {
    this.baseUrl = baseUrl || config.external_services.hostdata_url;
    this.timeout = timeout;
    
    logger.info('ExternalApiService initialized', {
      baseUrl: this.baseUrl,
      timeout: this.timeout
    });
  }

  /**
   * Generic fetch method with error handling using native https
   */
  private async fetchWithTimeout<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    return new Promise((resolve) => {
      logger.info(`Making request to external API: ${url}`);
      
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MCP-Dashboard-Server/1.0.0',
          'Host': urlObj.hostname
        },
        timeout: this.timeout,
        rejectUnauthorized: false // Handle SSL certificate issues with external API
      };

      const req = https.request(options, (res) => {
        logger.info(`Response received from ${url} with status ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              const jsonData = JSON.parse(data);
              logger.debug(`External API success: ${url}`, { 
                status: res.statusCode,
                dataLength: Array.isArray(jsonData) ? jsonData.length : Object.keys(jsonData || {}).length,
              });
              
              resolve({
                success: true,
                data: jsonData,
                statusCode: res.statusCode,
              });
            } else {
              const errorMessage = `HTTP ${res.statusCode}: ${res.statusMessage}`;
              logger.warn(`External API error: ${errorMessage}`, { url, status: res.statusCode });
              
              resolve({
                success: false,
                error: errorMessage,
                statusCode: res.statusCode,
              });
            }
          } catch (parseError) {
            const errorMessage = parseError instanceof Error ? parseError.message : 'JSON parse error';
            logger.error(`Failed to parse response from ${url}: ${errorMessage}`);
            
            resolve({
              success: false,
              error: `Parse error: ${errorMessage}`,
            });
          }
        });
      });

      req.on('timeout', () => {
        logger.warn(`Request timeout after ${this.timeout}ms for ${url}`);
        req.destroy();
        resolve({
          success: false,
          error: `Timeout after ${this.timeout}ms`,
        });
      });

      req.on('error', (error) => {
        const errorMessage = error.message || 'Unknown error';
        logger.error(`External API request failed: ${url} - ${error.name}: ${errorMessage}`);
        
        resolve({
          success: false,
          error: `${error.name}: ${errorMessage}`,
        });
      });

      req.setTimeout(this.timeout);
      req.end();
    });
  }

  /**
   * Fetch sales data
   */
  async getSalesData(): Promise<ApiResponse> {
    return this.fetchWithTimeout('/sales');
  }

  /**
   * Fetch customers data
   */
  async getCustomersData(): Promise<ApiResponse> {
    return this.fetchWithTimeout('/customers');
  }

  /**
   * Fetch dashboard metrics
   */
  async getDashboardMetrics(): Promise<ApiResponse> {
    return this.fetchWithTimeout('/metrics/dashboard');
  }

  /**
   * Fetch items/inventory data
   */
  async getItemsData(): Promise<ApiResponse> {
    return this.fetchWithTimeout('/items');
  }

  /**
   * Fetch sales summary with period filter
   */
  async getSalesSummary(period: string): Promise<ApiResponse> {
    return this.fetchWithTimeout(`/metrics/sales-summary?period=${encodeURIComponent(period)}`);
  }

  /**
   * Fetch customer analytics
   */
  async getCustomerAnalytics(): Promise<ApiResponse> {
    return this.fetchWithTimeout('/metrics/customer-analytics');
  }

  /**
   * Fetch inventory status
   */
  async getInventoryStatus(): Promise<ApiResponse> {
    return this.fetchWithTimeout('/metrics/inventory-status');
  }

  /**
   * Health check for external API
   */
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await this.fetchWithTimeout<{ status: string; timestamp: string }>('/health');
      return response;
    } catch (error) {
      // Fallback: try to fetch any endpoint to check connectivity
      const response = await this.fetchWithTimeout('/sales');
      return {
        success: response.success,
        data: response.success ? { status: 'healthy', timestamp: new Date().toISOString() } : undefined,
        error: response.error,
      };
    }
  }
}

/**
 * Default external API service instance
 */
export const externalApiService = new ExternalApiService();
