import { Router } from 'express';
import {
  getFacultyAssignments,
  getFacultySubmissions,
  getFacultySubmissionById,
  gradeSubmission,
} from '../controllers/faculty.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireFaculty } from '../middleware/role.middleware.js';

const router = Router();

// Apply faculty-only protection across all routes in this router
router.use(requireAuth, requireFaculty);

router.get('/assignments', getFacultyAssignments);
router.get('/submissions', getFacultySubmissions);
router.get('/submissions/:id', getFacultySubmissionById);
router.post('/submissions/:id/grade', gradeSubmission);

export default router;
