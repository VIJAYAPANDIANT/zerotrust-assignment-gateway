import { query } from '../config/db.js';

export const AuditModel = {
  /**
   * Log an access or authentication event
   */
  async logAccess({ userId = null, endpoint, action, result, ipAddress }) {
    try {
      await query(
        `INSERT INTO access_logs (user_id, endpoint, action, result, ip_address, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [userId, endpoint, action, result, ipAddress || '127.0.0.1']
      );
    } catch (err) {
      console.error('[Audit Logging Error]:', err.message);
    }
  },
};
