import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import assignmentRoutes from './assignment.routes.js';
import submissionRoutes from './submission.routes.js';
import facultyRoutes from './faculty.routes.js';
import adminRoutes from './admin.routes.js';
import securityRoutes from './security.routes.js';

const router = Router();

// Mount individual feature routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/faculty', facultyRoutes);
router.use('/admin', adminRoutes);
router.use('/security', securityRoutes);

export default router;
