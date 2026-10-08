import { SubmissionModel } from '../models/submission.model.js';
import { AssignmentModel } from '../models/assignment.model.js';
import { AuditModel } from '../models/audit.model.js';
import { storageService } from '../services/storage.service.js';

/**
 * GET /api/submissions/my
 * Retrieves all submissions authored by the calling student
 */
export const getMySubmissions = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const submissions = await SubmissionModel.findByStudentId(studentId);

    await AuditModel.logAccess({
      userId: studentId,
      endpoint: '/api/submissions/my',
      action: 'VIEW_MY_SUBMISSIONS',
      result: 'success',
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/submissions/:id
 * Retrieves a single submission by its ID.
 * Enforces fine-grained Zero Trust ownership checks:
 * - Student can ONLY view their own submission (Student A requesting Student B -> 403 Forbidden).
 * - Faculty and Admin can inspect submissions.
 */
export const getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const submission = await SubmissionModel.findByIdWithDetails(id);
    if (!submission) {
      await AuditModel.logAccess({
        userId: user.id,
        endpoint: `/api/submissions/${id}`,
        action: 'SUBMISSION_NOT_FOUND',
        result: 'failure',
        ipAddress: req.ip,
      });

      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Submission not found.',
      });
    }

    // Zero Trust Ownership Check: Student can ONLY view their own submission
    if (user.role === 'student' && submission.student_id !== user.id) {
      await AuditModel.logAccess({
        userId: user.id,
        endpoint: `/api/submissions/${id}`,
        action: 'UNAUTHORIZED_CROSS_STUDENT_SUBMISSION_ACCESS_BLOCKED',
        result: 'denied',
        ipAddress: req.ip,
      });

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: "Forbidden: You do not have permission to access another student's submission.",
      });
    }

    await AuditModel.logAccess({
      userId: user.id,
      endpoint: `/api/submissions/${id}`,
      action: 'VIEW_SUBMISSION_DETAIL',
      result: 'success',
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/submissions
 * Submits coursework for an assignment using Supabase Storage
 */
export const submitAssignment = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { assignment_id } = req.body;

    if (!assignment_id) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'assignment_id is required.',
      });
    }

    // 1. Verify assignment exists
    const assignment = await AssignmentModel.findById(assignment_id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Assignment not found.',
      });
    }

    let fileUrl = null;
    let storageProvider = null;

    // 2. Upload file to Supabase Storage if file attached
    if (req.file) {
      const uploadResult = await storageService.uploadSubmissionFile({
        studentId,
        assignmentId: assignment_id,
        fileBuffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      });

      fileUrl = uploadResult.storagePath;
      storageProvider = uploadResult.provider;
    } else if (req.body.file_url) {
      fileUrl = req.body.file_url.trim();
      storageProvider = 'external_url';
    }

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Please choose a valid PDF, DOC, or DOCX file to submit.',
      });
    }

    // 3. Save the file URL / path in submissions table
    const submission = await SubmissionModel.createOrUpdate({
      assignmentId: assignment_id,
      studentId,
      fileUrl,
    });

    // 4. Create an access log entry
    await AuditModel.logAccess({
      userId: studentId,
      endpoint: '/api/submissions',
      action: 'SUBMIT_ASSIGNMENT_STORAGE_UPLOAD',
      result: 'success',
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Assignment coursework submitted successfully to Supabase Storage.',
      data: {
        ...submission,
        storage_provider: storageProvider,
        assignment_title: assignment.title,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/submissions/:id/file
 * Secure retrieval of submission artifact
 * Enforces Zero Trust:
 * - Students can ONLY access their own submission files (Student A requesting Student B -> 403 Forbidden)
 * - Evaluator faculty and administrators are permitted
 * - Access attempts are logged in access_logs
 */
export const getSubmissionFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const submission = await SubmissionModel.findByIdWithDetails(id);
    if (!submission) {
      await AuditModel.logAccess({
        userId: user.id,
        endpoint: `/api/submissions/${id}/file`,
        action: 'RETRIEVE_SUBMISSION_FILE_NOT_FOUND',
        result: 'failure',
        ipAddress: req.ip,
      });

      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Submission record not found.',
      });
    }

    // Zero Trust Policy Enforcement: Students can ONLY access their own submissions
    if (user.role === 'student' && submission.student_id !== user.id) {
      await AuditModel.logAccess({
        userId: user.id,
        endpoint: `/api/submissions/${id}/file`,
        action: 'UNAUTHORIZED_CROSS_STUDENT_FILE_ACCESS_BLOCKED',
        result: 'denied',
        ipAddress: req.ip,
      });

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: "Forbidden: You do not have permission to access another student's submission file.",
      });
    }

    // Log authorized file access
    await AuditModel.logAccess({
      userId: user.id,
      endpoint: `/api/submissions/${id}/file`,
      action: 'RETRIEVE_SUBMISSION_FILE_AUTHORIZED',
      result: 'success',
      ipAddress: req.ip,
    });

    // Generate secure temporary access or file stream
    const access = await storageService.getFileAccess({
      filePath: submission.file_url,
      expiresInSeconds: 300,
    });

    if (access.type === 'signed_url') {
      if (req.query.format === 'json') {
        return res.status(200).json({
          success: true,
          download_url: access.url,
          expires_in: access.expiresIn,
        });
      }
      return res.redirect(access.url);
    } else if (access.type === 'local_file') {
      if (req.query.format === 'json') {
        return res.status(200).json({
          success: true,
          download_url: `/api/submissions/${id}/file?download=true`,
          storage_mode: 'local_secure',
        });
      }
      return res.sendFile(access.absolutePath);
    } else {
      return res.redirect(access.url || submission.file_url);
    }
  } catch (error) {
    next(error);
  }
};
