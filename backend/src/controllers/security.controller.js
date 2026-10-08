import { AuditModel } from '../models/audit.model.js';

/**
 * GET /api/security/logs
 * Retrieves application-level security audit logs and key metrics:
 * - Total Requests
 * - Allowed
 * - Blocked
 * - Authentication Failures
 *
 * NOTE: These are strictly application-level security logs originating from
 * the Node.js Express origin server (not Cloudflare edge logs).
 */
export const getSecurityLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;

    const [logs, stats] = await Promise.all([
      AuditModel.getLogs(limit),
      AuditModel.getStats(),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Application-level security audit logs retrieved successfully.',
      isCloudflare: false,
      source: 'application_level_security_logs',
      stats,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};
