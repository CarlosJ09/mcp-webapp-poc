/**
 * Session Manager Implementation
 * Infrastructure layer implementation for MCP session management
 */

import { ISessionManager } from '../../domain/interfaces/IMcpServices';
import { McpSession, SessionStatus, SessionConfig } from '../../domain/entities/McpSession';
import { ILogger } from '../../shared/types/ILogger';

/**
 * In-Memory Session Manager Implementation
 * Manages MCP sessions in memory with configurable cleanup
 */
export class SessionManager implements ISessionManager {
  private readonly sessions: Map<string, McpSession> = new Map();
  private readonly defaultConfig: SessionConfig;

  constructor(
    private readonly logger: ILogger,
    defaultConfig?: SessionConfig
  ) {
    this.defaultConfig = defaultConfig || {
      maxIdleTime: 600000, // 10 minutes
      cleanupInterval: 300000, // 5 minutes
    };
  }

  /**
   * Create new MCP session
   */
  async createSession(transport: any, config?: SessionConfig): Promise<McpSession> {
    try {
      const sessionConfig = config || this.defaultConfig;
      const session = new McpSession(transport, sessionConfig);

      // Store session
      this.sessions.set(session.id, session);

      this.logger.info('New MCP session created', {
        sessionId: session.id,
        totalSessions: this.sessions.size,
        config: sessionConfig
      });

      return session;
    } catch (error) {
      this.logger.error('Failed to create MCP session', error as Error);
      throw new Error('Unable to create MCP session');
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<McpSession | null> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (session) {
        // Check and update idle status
        session.checkIdleStatus();
        
        this.logger.debug('Session retrieved', {
          sessionId,
          status: session.status,
          isIdle: session.isIdle()
        });
      } else {
        this.logger.debug('Session not found', { sessionId });
      }

      return session || null;
    } catch (error) {
      this.logger.error('Failed to get session', error as Error, { sessionId });
      return null;
    }
  }

  /**
   * Get all active sessions
   */
  async getActiveSessions(): Promise<McpSession[]> {
    try {
      const activeSessions = Array.from(this.sessions.values())
        .filter(session => 
          session.status === SessionStatus.ACTIVE || 
          session.status === SessionStatus.IDLE
        );

      this.logger.debug('Active sessions retrieved', {
        activeCount: activeSessions.length,
        totalSessions: this.sessions.size
      });

      return activeSessions;
    } catch (error) {
      this.logger.error('Failed to get active sessions', error as Error);
      return [];
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (session) {
        session.updateActivity();
        
        this.logger.debug('Session activity updated', {
          sessionId,
          status: session.status,
          lastActivity: session.lastActivity
        });
      } else {
        this.logger.warn('Attempted to update activity for non-existent session', { sessionId });
      }
    } catch (error) {
      this.logger.error('Failed to update session activity', error as Error, { sessionId });
    }
  }

  /**
   * Close session
   */
  async closeSession(sessionId: string, reason?: string): Promise<void> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (session) {
        session.close(reason);
        this.sessions.delete(sessionId);
        
        this.logger.info('Session closed and removed', {
          sessionId,
          reason,
          duration: session.getDuration(),
          remainingSessions: this.sessions.size
        });
      } else {
        this.logger.warn('Attempted to close non-existent session', { sessionId });
      }
    } catch (error) {
      this.logger.error('Failed to close session', error as Error, { sessionId, reason });
    }
  }

  /**
   * Cleanup idle sessions
   */
  async cleanupIdleSessions(): Promise<number> {
    try {
      const sessionsToCleanup = Array.from(this.sessions.entries())
        .filter(([_, session]) => session.shouldCleanup());

      let cleanedCount = 0;

      for (const [sessionId, session] of sessionsToCleanup) {
        try {
          session.close('idle_cleanup');
          this.sessions.delete(sessionId);
          cleanedCount++;
          
          this.logger.debug('Session cleaned up', {
            sessionId,
            status: session.status,
            duration: session.getDuration()
          });
        } catch (error) {
          this.logger.error('Failed to cleanup individual session', error as Error, { sessionId });
        }
      }

      if (cleanedCount > 0) {
        this.logger.info('Session cleanup completed', {
          cleanedCount,
          remainingSessions: this.sessions.size
        });
      }

      return cleanedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup idle sessions', error as Error);
      return 0;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    total: number;
    active: number;
    idle: number;
    closed: number;
  }> {
    try {
      const allSessions = Array.from(this.sessions.values());
      
      const stats = {
        total: allSessions.length,
        active: allSessions.filter(s => s.status === SessionStatus.ACTIVE).length,
        idle: allSessions.filter(s => s.status === SessionStatus.IDLE).length,
        closed: allSessions.filter(s => s.status === SessionStatus.CLOSED).length
      };

      this.logger.debug('Session statistics calculated', stats);
      
      return stats;
    } catch (error) {
      this.logger.error('Failed to get session statistics', error as Error);
      return {
        total: 0,
        active: 0,
        idle: 0,
        closed: 0
      };
    }
  }

  /**
   * Get detailed session information (for debugging/monitoring)
   */
  async getDetailedSessionInfo(): Promise<any[]> {
    try {
      const sessions = Array.from(this.sessions.values());
      
      const detailedInfo = sessions.map(session => ({
        id: session.id,
        status: session.status,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        duration: session.getDuration(),
        isIdle: session.isIdle(),
        shouldCleanup: session.shouldCleanup(),
        config: session.config
      }));

      this.logger.debug('Detailed session info compiled', {
        sessionCount: detailedInfo.length
      });

      return detailedInfo;
    } catch (error) {
      this.logger.error('Failed to get detailed session info', error as Error);
      return [];
    }
  }

  /**
   * Force cleanup all sessions (for shutdown)
   */
  async forceCleanupAllSessions(): Promise<void> {
    try {
      const sessionCount = this.sessions.size;
      
      for (const [sessionId, session] of this.sessions.entries()) {
        try {
          session.close('force_shutdown');
        } catch (error) {
          this.logger.error('Error closing session during force cleanup', error as Error, { sessionId });
        }
      }

      this.sessions.clear();
      
      this.logger.info('Force cleanup of all sessions completed', {
        cleanedSessions: sessionCount
      });
    } catch (error) {
      this.logger.error('Failed to force cleanup all sessions', error as Error);
    }
  }
}
