/**
 * Logger Interface
 * Defines contract for logging operations following Interface Segregation Principle
 */

export interface ILogger {
  /**
   * Log error message
   */
  error(message: string, error?: Error, data?: any): void;

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void;

  /**
   * Log info message
   */
  info(message: string, data?: any): void;

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void;

  /**
   * Log request/response for debugging
   */
  logRequest(method: string, url: string, body?: any, headers?: any): void;

  /**
   * Log response for debugging
   */
  logResponse(statusCode: number, body?: any, duration?: number): void;

  /**
   * Create child logger with extended context
   */
  child(childContext: string): ILogger;

  /**
   * Set context for this logger instance
   */
  setContext(context: string): void;

  /**
   * Get current context
   */
  getContext(): string;
}
