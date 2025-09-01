/**
 * Dependency Injection Container
 * Simple IoC container for managing dependencies
 * Follows Dependency Inversion Principle
 */

import { ILogger } from '../types/ILogger';

/**
 * Service Registration Map
 */
type ServiceFactory<T = any> = () => T;
type ServiceInstance<T = any> = T;

/**
 * Simple Dependency Injection Container
 */
export class Container {
  private services = new Map<string, ServiceFactory>();
  private instances = new Map<string, ServiceInstance>();
  private logger: ILogger | null = null;

  /**
   * Register a service factory
   */
  register<T>(name: string, factory: ServiceFactory<T>): void {
    this.services.set(name, factory);
    
    if (this.logger) {
      this.logger.debug('Service registered', { serviceName: name });
    }
  }

  /**
   * Register a singleton service
   */
  registerSingleton<T>(name: string, factory: ServiceFactory<T>): void {
    this.services.set(name, () => {
      if (!this.instances.has(name)) {
        const instance = factory();
        this.instances.set(name, instance);
        
        if (this.logger) {
          this.logger.debug('Singleton service instantiated', { serviceName: name });
        }
      }
      return this.instances.get(name);
    });

    if (this.logger) {
      this.logger.debug('Singleton service registered', { serviceName: name });
    }
  }

  /**
   * Register an instance directly
   */
  registerInstance<T>(name: string, instance: T): void {
    this.instances.set(name, instance);
    this.services.set(name, () => instance);

    if (this.logger) {
      this.logger.debug('Service instance registered', { serviceName: name });
    }
  }

  /**
   * Get a service instance
   */
  get<T>(name: string): T {
    const factory = this.services.get(name);
    
    if (!factory) {
      throw new Error(`Service '${name}' not found in container`);
    }

    try {
      const instance = factory();
      
      if (this.logger) {
        this.logger.debug('Service retrieved', { serviceName: name });
      }
      
      return instance as T;
    } catch (error) {
      if (this.logger) {
        this.logger.error('Failed to create service instance', error as Error, { serviceName: name });
      }
      throw new Error(`Failed to create service '${name}': ${(error as Error).message}`);
    }
  }

  /**
   * Check if service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get all registered service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Clear all registrations (for testing)
   */
  clear(): void {
    this.services.clear();
    this.instances.clear();
    
    if (this.logger) {
      this.logger.debug('Container cleared');
    }
  }

  /**
   * Set logger for container operations
   */
  setLogger(logger: ILogger): void {
    this.logger = logger;
  }

  /**
   * Get container statistics
   */
  getStats(): {
    registeredServices: number;
    instantiatedServices: number;
    serviceNames: string[];
  } {
    return {
      registeredServices: this.services.size,
      instantiatedServices: this.instances.size,
      serviceNames: this.getServiceNames()
    };
  }
}

/**
 * Global container instance
 */
export const container = new Container();
