import { Router } from 'express';
import {
  getAdminOverview,
  getAdminLogs,
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Apply admin-only protection across all administrative routes
// Students and Faculty attempting these endpoints receive 403 Forbidden
router.use(requireAuth, requireRole('admin'));

router.get('/overview', getAdminOverview);
router.get('/logs', getAdminLogs);

export default router;
