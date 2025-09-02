/**
 * @fileoverview Dependency Injection Container
 * Simplified container for current implementation
 */

import { createLogger } from '../config/logger';
import { externalApiService } from '../../infrastructure/external/api-service';

/**
 * Dependency Injection Container
 * Simplified singleton pattern for managing dependencies
 */
export class DIContainer {
  private static instance: DIContainer;
  
  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Service getters
  public get logger(): any {
    return createLogger('DIContainer');
  }

  public get apiService(): any {
    return externalApiService;
  }
}

export const container = DIContainer.getInstance();
