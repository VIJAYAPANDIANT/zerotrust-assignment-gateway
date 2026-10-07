import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import assignmentRoutes from './assignment.routes.js';
import submissionRoutes from './submission.routes.js';

const router = Router();

// Mount individual feature routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);

export default router;
