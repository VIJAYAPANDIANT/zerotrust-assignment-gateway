import { Router } from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
} from '../controllers/assignment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireFaculty } from '../middleware/role.middleware.js';

const router = Router();

// Protected: All authenticated users can view assignments
router.get('/', requireAuth, getAssignments);
router.get('/:id', requireAuth, getAssignmentById);

// Protected: Only faculty can create assignments
router.post('/', requireAuth, requireFaculty, createAssignment);

export default router;
