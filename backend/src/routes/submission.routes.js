import { Router } from 'express';
import {
  getMySubmissions,
  submitAssignment,
} from '../controllers/submission.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireStudent } from '../middleware/role.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// Student-only submission routes
router.get('/my', requireAuth, requireStudent, getMySubmissions);
router.post(
  '/',
  requireAuth,
  requireStudent,
  upload.single('file'),
  submitAssignment
);

export default router;
