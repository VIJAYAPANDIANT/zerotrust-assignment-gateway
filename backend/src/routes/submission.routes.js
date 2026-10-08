import { Router } from 'express';
import {
  getMySubmissions,
  submitAssignment,
  getSubmissionById,
  getSubmissionFile,
} from '../controllers/submission.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// Student-only submission routes
router.get('/my', requireAuth, requireRole('student'), getMySubmissions);
router.post(
  '/',
  requireAuth,
  requireRole('student'),
  upload.single('file'),
  submitAssignment
);

// Submission detail route with ownership check (Student can only view own; Faculty/Admin can view)
router.get('/:id', requireAuth, getSubmissionById);

// Secure file retrieval route with ownership check (Student can only view own; Faculty/Admin can view)
router.get('/:id/file', requireAuth, getSubmissionFile);

export default router;
