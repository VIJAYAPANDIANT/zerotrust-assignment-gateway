import { Router } from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
} from '../controllers/assignment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Protected: Authenticated student, faculty, and admin roles can view assignments
router.get('/', requireAuth, requireRole('student', 'faculty', 'admin'), getAssignments);
router.get('/:id', requireAuth, requireRole('student', 'faculty', 'admin'), getAssignmentById);

// Protected: Only faculty can create assignments (Student receives 403 Forbidden)
router.post('/', requireAuth, requireRole('faculty'), createAssignment);

export default router;
