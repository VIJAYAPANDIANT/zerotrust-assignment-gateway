import { query } from '../config/db.js';
import { AuditModel } from '../models/audit.model.js';

/**
 * GET /api/admin/overview
 * System health and administrative overview.
 * Reserved for future administrative functionality.
 */
export const getAdminOverview = async (req, res, next) => {
  try {
    await AuditModel.logAccess({
      userId: req.user.id,
      endpoint: '/api/admin/overview',
      action: 'ADMIN_VIEW_OVERVIEW',
      result: 'success',
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Zero Trust Administrator Overview.',
      data: {
        adminUser: req.user.email,
        role: req.user.role,
        gatewayStatus: 'active',
        zeroTrustPolicy: 'enforced',
        features: ['user_management', 'system_audit', 'policy_editor'],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/logs
 * Retrieves system audit logs for administrative inspection.
 */
export const getAdminLogs = async (req, res, next) => {
  try {
    const logs = await query('SELECT * FROM access_logs ORDER BY created_at DESC LIMIT 50');

    await AuditModel.logAccess({
      userId: req.user.id,
      endpoint: '/api/admin/logs',
      action: 'ADMIN_VIEW_AUDIT_LOGS',
      result: 'success',
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      data: logs.rows || [],
    });
  } catch (error) {
    next(error);
  }
};
