import { AuditModel } from '../models/audit.model.js';

/**
 * Reusable Role-Based Authorization Middleware: requireRole(...roles)
 *
 * Enforces fine-grained application-level authorization.
 *
 * @param {...string|string[]} roles - Allowed role(s) (e.g., 'student', 'faculty', 'admin')
 * @returns {import('express').RequestHandler}
 *
 * Behavior:
 * - 401 Unauthorized: caller is not authenticated (no req.user).
 * - 403 Forbidden: caller is authenticated but lacks required role.
 */
export const requireRole = (...roles) => {
  // Support both rest parameters requireRole('a', 'b') and array requireRole(['a', 'b'])
  const allowedRoles = roles.flat();

  return async (req, res, next) => {
    // 1. Verify user authentication context exists (401 = unauthenticated)
    if (!req.user) {
      await AuditModel.logAccess({
        userId: null,
        endpoint: req.originalUrl,
        action: 'UNAUTHORIZED_API_ATTEMPT',
        result: 'FAILURE',
        ipAddress: req.ip,
      });

      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required. Please authenticate to access this resource.',
      });
    }

    // 2. Verify caller role is permitted (403 = authenticated but unauthorized)
    if (!allowedRoles.includes(req.user.role)) {
      await AuditModel.logAccess({
        userId: req.user.id,
        endpoint: req.originalUrl,
        action: 'UNAUTHORIZED_API_ATTEMPT',
        result: 'BLOCK',
        ipAddress: req.ip,
      });

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Forbidden: Access requires [${allowedRoles.join(', ')}] role. Current role: '${req.user.role}'.`,
      });
    }

    next();
  };
};

// Convenience shorthand middlewares
export const requireStudent = requireRole('student');
export const requireFaculty = requireRole('faculty');
export const requireAdmin = requireRole('admin');
