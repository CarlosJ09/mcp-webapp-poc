/**
 * Logger Implementation
 * Concrete implementation of ILogger interface
 * Provides structured logging with different levels and formatters
 */

import { ILogger } from '../types/ILogger';
import { appConfig } from '../config/appConfig';

/**
 * Log levels enum
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * Log entry interface
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: Error;
}

/**
 * Logger Implementation
 * Provides structured logging with configurable output formats
 */
export class Logger implements ILogger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  /**
   * Create a new logger instance with context
   */
  static create(context: string): Logger {
    return new Logger(context);
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const configLevel = appConfig.logging.level as LogLevel;
    const currentLevelIndex = levels.indexOf(level);
    const configLevelIndex = levels.indexOf(configLevel);
    
    return currentLevelIndex <= configLevelIndex;
  }

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    if (appConfig.logging.format === 'json') {
      return JSON.stringify(entry);
    }
    
    // Simple text format
    let output = `[${entry.timestamp}] ${entry.level.toUpperCase()}`;
    if (entry.context) {
      output += ` [${entry.context}]`;
    }
    output += `: ${entry.message}`;
    
    if (entry.data) {
      output += ` - ${JSON.stringify(entry.data)}`;
    }
    
    if (entry.error) {
      output += `\n${entry.error.stack}`;
    }
    
    return output;
  }

  /**
   * Log a message with specified level
   */
  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
      error,
    };

    const formattedLog = this.formatLog(entry);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log debug message (only if debug logs are enabled)
   */
  debug(message: string, data?: any): void {
    if (appConfig.logging.enableDebug) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * Log request/response for debugging
   */
  logRequest(method: string, url: string, body?: any, headers?: any): void {
    if (!appConfig.logging.enableDebug) return;
    
    this.debug(`${method} ${url}`, {
      body: body ? JSON.stringify(body).substring(0, 500) : undefined,
      headers,
    });
  }

  /**
   * Log response for debugging
   */
  logResponse(statusCode: number, body?: any, duration?: number): void {
    if (!appConfig.logging.enableDebug) return;
    
    this.debug(`Response ${statusCode}`, {
      body: body ? JSON.stringify(body).substring(0, 500) : undefined,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  /**
   * Set context for this logger instance
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Get current context
   */
  getContext(): string {
    return this.context;
  }

  /**
   * Create child logger with extended context
   */
  child(childContext: string): Logger {
    return new Logger(`${this.context}:${childContext}`);
  }
}

/**
 * Default logger instance
 */
export const logger = Logger.create('MCP-Server');

/**
 * Create logger for specific context
 */
export const createLogger = (context: string): Logger => Logger.create(context);
