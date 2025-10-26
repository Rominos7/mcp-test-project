import { config } from "../../config/env.config.js";

export interface Session {
  id: string;
  createdAt: Date;
  lastAccessedAt: Date;
}

/**
 * In-memory session storage
 * For production, use Redis or another distributed cache
 */
class SessionManager {
  private sessions = new Map<string, Session>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Get existing session or create a new one
   */
  getOrCreateSession(sessionId?: string): Session {
    if (sessionId && this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!;
      session.lastAccessedAt = new Date();
      return session;
    }

    const newSession: Session = {
      id: this.generateSessionId(),
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    };
    this.sessions.set(newSession.id, newSession);
    return newSession;
  }

  /**
   * Check if a session exists and is valid
   */
  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastAccessedAt.getTime() > config.sessionTimeout) {
        this.sessions.delete(sessionId);
        console.log(`Session expired: ${sessionId}`);
      }
    }
  }

  /**
   * Start automatic cleanup of expired sessions
   */
  startCleanup(): void {
    if (this.cleanupInterval) {
      return; // Already running
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, config.sessionCleanupInterval);

    console.log(`Session cleanup started (interval: ${config.sessionCleanupInterval}ms)`);
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log("Session cleanup stopped");
    }
  }

  /**
   * Get session statistics
   */
  getStats() {
    return {
      totalSessions: this.sessions.size,
      sessions: Array.from(this.sessions.values()),
    };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();
