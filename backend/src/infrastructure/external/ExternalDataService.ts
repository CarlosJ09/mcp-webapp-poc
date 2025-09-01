/**
 * External Data Service Implementation
 * Infrastructure layer for external API communication
 * Follows Dependency Inversion and Single Responsibility principles
 */

import { IExternalDataService } from '../../domain/interfaces/IRepositories';
import { ILogger } from '../../shared/types/ILogger';

/**
 * HTTP Client Configuration
 */
interface HttpClientConfig {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly retryCount: number;
  readonly retryDelay: number;
  readonly headers: Record<string, string>;
}

/**
 * External Data Service Implementation
 * Handles communication with external APIs and data sources
 */
export class ExternalDataService implements IExternalDataService {
  private readonly config: HttpClientConfig;

  constructor(
    config: Partial<HttpClientConfig>,
    private readonly logger: ILogger
  ) {
    // Set default configuration
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:8080',
      timeout: config.timeout || 30000,
      retryCount: config.retryCount || 3,
      retryDelay: config.retryDelay || 1000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config.headers
      }
    };

    this.logger.info('External Data Service initialized', {
      baseUrl: this.config.baseUrl,
      timeout: this.config.timeout,
      retryCount: this.config.retryCount
    });
  }

  /**
   * Fetch data from external API with retry logic
   */
  async fetchData(endpoint: string, params?: Record<string, any>): Promise<any> {
    const url = this.buildUrl(endpoint, params);
    
    for (let attempt = 1; attempt <= this.config.retryCount; attempt++) {
      try {
        this.logger.debug('Fetching data from external API', {
          url,
          attempt,
          maxAttempts: this.config.retryCount
        });

        const response = await this.makeHttpRequest(url);
        
        this.logger.debug('External API request successful', {
          url,
          statusCode: response.status,
          attempt
        });

        return await response.json();
      } catch (error) {
        this.logger.warn('External API request failed', {
          error: (error as Error).message,
          url,
          attempt,
          maxAttempts: this.config.retryCount
        });

        // If last attempt, throw error
        if (attempt === this.config.retryCount) {
          this.logger.error('All retry attempts failed for external API request', 
            error as Error, { url });
          throw new Error(`External API request failed after ${this.config.retryCount} attempts: ${(error as Error).message}`);
        }

        // Wait before retry
        await this.delay(this.config.retryDelay * attempt);
      }
    }

    throw new Error('Unexpected error in external API request');
  }

  /**
   * Check if external service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      this.logger.debug('Performing external service health check');

      const healthUrl = this.buildUrl('/health');
      const response = await this.makeHttpRequest(healthUrl, 5000); // Short timeout for health check

      const isHealthy = response.ok;
      
      this.logger.info('External service health check completed', {
        url: healthUrl,
        healthy: isHealthy,
        statusCode: response.status
      });

      return isHealthy;
    } catch (error) {
      this.logger.error('External service health check failed', error as Error);
      return false;
    }
  }

  /**
   * Get service configuration
   */
  getConfiguration(): {
    baseUrl: string;
    timeout: number;
    retryCount: number;
  } {
    return {
      baseUrl: this.config.baseUrl,
      timeout: this.config.timeout,
      retryCount: this.config.retryCount
    };
  }

  /**
   * Build complete URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    let url = `${baseUrl}${cleanEndpoint}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return url;
  }

  /**
   * Make HTTP request with timeout
   */
  private async makeHttpRequest(url: string, timeoutMs?: number): Promise<Response> {
    const timeout = timeoutMs || this.config.timeout;
    const controller = new AbortController();
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.config.headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test connection to external service
   */
  async testConnection(): Promise<{
    connected: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      this.logger.debug('Testing connection to external service');
      
      await this.healthCheck();
      const responseTime = Date.now() - startTime;
      
      this.logger.info('Connection test successful', {
        responseTime,
        baseUrl: this.config.baseUrl
      });
      
      return {
        connected: true,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = (error as Error).message;
      
      this.logger.error('Connection test failed', error as Error, {
        responseTime,
        baseUrl: this.config.baseUrl
      });
      
      return {
        connected: false,
        responseTime,
        error: errorMessage
      };
    }
  }

  /**
   * Get service metrics
   */
  async getServiceMetrics(): Promise<any> {
    try {
      this.logger.debug('Fetching service metrics');
      
      const [healthStatus, connectionTest] = await Promise.all([
        this.healthCheck(),
        this.testConnection()
      ]);

      const metrics = {
        healthy: healthStatus,
        connection: connectionTest,
        config: this.getConfiguration(),
        timestamp: new Date().toISOString()
      };

      this.logger.debug('Service metrics compiled', {
        healthy: healthStatus,
        connected: connectionTest.connected
      });

      return metrics;
    } catch (error) {
      this.logger.error('Failed to get service metrics', error as Error);
      return {
        healthy: false,
        connection: { connected: false, responseTime: 0, error: (error as Error).message },
        config: this.getConfiguration(),
        timestamp: new Date().toISOString(),
        error: (error as Error).message
      };
    }
  }
}
