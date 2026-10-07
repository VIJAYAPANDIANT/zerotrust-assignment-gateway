import { Router } from 'express';
import {
  getAssignments,
  getAssignmentById,
} from '../controllers/assignment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Protected: All authenticated users can view assignments
router.get('/', requireAuth, getAssignments);
router.get('/:id', requireAuth, getAssignmentById);

export default router;
