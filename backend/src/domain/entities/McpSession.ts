/**
 * MCP Session Domain Entity
 * Represents a Model Context Protocol session with its lifecycle management
 */

import { randomUUID } from "node:crypto";

export interface SessionConfig {
  readonly maxIdleTime: number; // milliseconds
  readonly cleanupInterval: number; // milliseconds
}

export enum SessionStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  IDLE = 'idle',
  CLOSED = 'closed',
  ERROR = 'error'
}

/**
 * MCP Session Entity
 * Manages the lifecycle and state of an MCP session
 */
export class McpSession {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _lastActivity: Date;
  private _status: SessionStatus;
  private _transport: any; // Transport instance
  private _config: SessionConfig;

  constructor(
    transport: any,
    config: SessionConfig,
    id?: string
  ) {
    this._id = id || randomUUID();
    this._createdAt = new Date();
    this._lastActivity = new Date();
    this._status = SessionStatus.INITIALIZING;
    this._transport = transport;
    this._config = config;

    this.validateConfig(config);
    this.setupSession();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  get lastActivity(): Date {
    return new Date(this._lastActivity);
  }

  get status(): SessionStatus {
    return this._status;
  }

  get transport(): any {
    return this._transport;
  }

  get config(): SessionConfig {
    return { ...this._config };
  }

  /**
   * Business rule: Update session activity and status
   */
  updateActivity(): void {
    if (this._status === SessionStatus.CLOSED || this._status === SessionStatus.ERROR) {
      throw new Error('Cannot update activity on a closed or error session');
    }
    
    this._lastActivity = new Date();
    
    if (this._status === SessionStatus.IDLE) {
      this._status = SessionStatus.ACTIVE;
    }
  }

  /**
   * Business rule: Check if session is idle based on configuration
   */
  isIdle(): boolean {
    const idleTime = Date.now() - this._lastActivity.getTime();
    return idleTime > this._config.maxIdleTime;
  }

  /**
   * Business rule: Mark session as idle if inactive
   */
  checkIdleStatus(): void {
    if (this._status === SessionStatus.ACTIVE && this.isIdle()) {
      this._status = SessionStatus.IDLE;
    }
  }

  /**
   * Business rule: Activate session (from initializing to active)
   */
  activate(): void {
    if (this._status !== SessionStatus.INITIALIZING) {
      throw new Error('Session can only be activated from initializing status');
    }
    
    this._status = SessionStatus.ACTIVE;
    this.updateActivity();
  }

  /**
   * Business rule: Close session and cleanup resources
   */
  close(reason?: string): void {
    if (this._status === SessionStatus.CLOSED) {
      return; // Already closed
    }

    try {
      if (this._transport && typeof this._transport.close === 'function') {
        this._transport.close();
      }
    } catch (error) {
      // Log error but continue closing
      console.error(`Error closing transport for session ${this._id}:`, error);
    }

    this._status = SessionStatus.CLOSED;
  }

  /**
   * Business rule: Handle session error
   */
  setError(error: Error): void {
    this._status = SessionStatus.ERROR;
    console.error(`Session ${this._id} error:`, error);
  }

  /**
   * Business rule: Get session duration in milliseconds
   */
  getDuration(): number {
    return Date.now() - this._createdAt.getTime();
  }

  /**
   * Business rule: Check if session should be cleaned up
   */
  shouldCleanup(): boolean {
    return this._status === SessionStatus.CLOSED || 
           this._status === SessionStatus.ERROR ||
           (this._status === SessionStatus.IDLE && this.isIdle());
  }

  /**
   * Private setup method
   */
  private setupSession(): void {
    // Setup transport close handler
    if (this._transport && typeof this._transport.onclose === 'function') {
      this._transport.onclose = () => {
        this._status = SessionStatus.CLOSED;
      };
    }
  }

  /**
   * Private validation method
   */
  private validateConfig(config: SessionConfig): void {
    if (config.maxIdleTime <= 0) {
      throw new Error('Session max idle time must be greater than 0');
    }
    
    if (config.cleanupInterval <= 0) {
      throw new Error('Session cleanup interval must be greater than 0');
    }
    
    if (config.cleanupInterval >= config.maxIdleTime) {
      throw new Error('Cleanup interval should be less than max idle time');
    }
  }
}
