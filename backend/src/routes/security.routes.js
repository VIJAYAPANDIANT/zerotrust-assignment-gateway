import { Router } from 'express';
import { getSecurityLogs } from '../controllers/security.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { config } from '../config/environment.js';

const router = Router();

/**
 * Access Control Middleware for Security Logs
 * Enforces eventual administrator-only access while allowing testing in development.
 */
const requireAdminOrDev = (req, res, next) => {
  // 1. Admin role always granted access
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // 2. In development environment, allow authenticated testing access
  if (config.nodeEnv === 'development' && req.user) {
    return next();
  }

  // 3. Otherwise reject with 403 Forbidden
  return res.status(403).json({
    success: false,
    error: 'Forbidden',
    message: 'Forbidden: Access to security logs requires administrator role.',
  });
};

// GET /api/security/logs
router.get('/logs', requireAuth, requireAdminOrDev, getSecurityLogs);

export default router;
