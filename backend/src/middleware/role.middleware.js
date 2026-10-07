import { AuditModel } from '../models/audit.model.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role restrictions at the gateway endpoint layer.
 *
 * @param {string|string[]} allowedRoles - Role or array of roles permitted to access
 */
export const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (req, res, next) => {
    if (!req.user) {
      await AuditModel.logAccess({
        userId: null,
        endpoint: req.originalUrl,
        action: 'ACCESS_DENIED_UNAUTHENTICATED',
        result: 'denied',
        ipAddress: req.ip,
      });

      return res.status(401).json({
        success: false,
        message: 'Authentication required. No user context found.',
      });
    }

    if (!roles.includes(req.user.role)) {
      await AuditModel.logAccess({
        userId: req.user.id,
        endpoint: req.originalUrl,
        action: `ACCESS_DENIED_${req.user.role.toUpperCase()}`,
        result: 'denied',
        ipAddress: req.ip,
      });

      return res.status(403).json({
        success: false,
        message: `Forbidden. Access restricted to [${roles.join(', ')}] role(s). Current role: "${req.user.role}".`,
      });
    }

    next();
  };
};

// Convenience shorthand for student-only routes
export const requireStudent = requireRole('student');
