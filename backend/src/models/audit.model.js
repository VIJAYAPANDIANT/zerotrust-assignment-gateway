import { query } from '../config/db.js';

/**
 * Standardize audit result values to ALLOW, BLOCK, or FAILURE
 */
function normalizeResult(rawResult) {
  if (!rawResult) return 'ALLOW';
  const val = String(rawResult).toUpperCase().trim();
  if (['ALLOW', 'SUCCESS'].includes(val)) return 'ALLOW';
  if (['BLOCK', 'DENIED', 'FORBIDDEN'].includes(val)) return 'BLOCK';
  if (['FAILURE', 'FAILED', 'ERROR'].includes(val)) return 'FAILURE';
  return val;
}

export const AuditModel = {
  /**
   * Log an access, authentication, or security event
   *
   * @param {Object} params
   * @param {string|null} params.userId - User UUID (or null if unauthenticated)
   * @param {string} params.endpoint - Target API endpoint URL
   * @param {string} params.action - Event action identifier
   * @param {'ALLOW'|'BLOCK'|'FAILURE'|string} params.result - Security decision result
   * @param {string} params.ipAddress - Client IP address
   */
  async logAccess({ userId = null, endpoint, action, result, ipAddress }) {
    try {
      const normalizedResult = normalizeResult(result);
      await query(
        `INSERT INTO access_logs (user_id, endpoint, action, result, ip_address, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [userId, endpoint, action, normalizedResult, ipAddress || '127.0.0.1']
      );
    } catch (err) {
      console.error('[Audit Logging Error]:', err.message);
    }
  },

  /**
   * Retrieve recent security audit logs
   *
   * @param {number} [limit=100] - Maximum number of logs to return
   */
  async getLogs(limit = 100) {
    const res = await query(
      `SELECT l.id, l.user_id, l.endpoint, l.action, l.result, l.ip_address, l.created_at,
              u.name as user_name, u.email as user_email, u.role as user_role
       FROM access_logs l
       LEFT JOIN users u ON l.user_id = u.id
       ORDER BY l.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  },

  /**
   * Retrieve high-level security KPI statistics:
   * Total Requests, Allowed, Blocked, and Authentication Failures
   */
  async getStats() {
    const res = await query(`SELECT result, action FROM access_logs`);
    const rows = res.rows || [];

    const stats = {
      totalRequests: rows.length,
      allowed: rows.filter((r) => r.result === 'ALLOW').length,
      blocked: rows.filter((r) => r.result === 'BLOCK').length,
      authFailures: rows.filter(
        (r) => r.result === 'FAILURE' || r.action === 'LOGIN_FAILURE'
      ).length,
    };

    return stats;
  },
};
