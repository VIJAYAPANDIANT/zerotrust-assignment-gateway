import { AssignmentModel } from '../models/assignment.model.js';
import { SubmissionModel } from '../models/submission.model.js';
import { AuditModel } from '../models/audit.model.js';

/**
 * GET /api/faculty/assignments
 * Retrieves all coursework assignments authored by the authenticated faculty member
 */
export const getFacultyAssignments = async (req, res, next) => {
  try {
    const facultyId = req.user.id;
    const assignments = await AssignmentModel.findByFacultyId(facultyId);

    await AuditModel.logAccess({
      userId: facultyId,
      endpoint: '/api/faculty/assignments',
      action: 'FACULTY_VIEW_ASSIGNMENTS',
      result: 'success',
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/faculty/submissions
 * Retrieves all student submissions across courses evaluated by this faculty member
 */
export const getFacultySubmissions = async (req, res, next) => {
  try {
    const facultyId = req.user.id;
    const submissions = await SubmissionModel.findByFaculty(facultyId);

    await AuditModel.logAccess({
      userId: facultyId,
      endpoint: '/api/faculty/submissions',
      action: 'FACULTY_VIEW_SUBMISSIONS',
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
 * GET /api/faculty/submissions/:id
 * Retrieves complete evaluation details for a specific submission
 */
export const getFacultySubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await SubmissionModel.findByIdWithDetails(id);

    if (!submission) {
      await AuditModel.logAccess({
        userId: req.user.id,
        endpoint: `/api/faculty/submissions/${id}`,
        action: 'FACULTY_SUBMISSION_NOT_FOUND',
        result: 'failure',
        ipAddress: req.ip,
      });

      return res.status(404).json({
        success: false,
        message: 'Submission not found.',
      });
    }

    await AuditModel.logAccess({
      userId: req.user.id,
      endpoint: `/api/faculty/submissions/${id}`,
      action: 'FACULTY_VIEW_SUBMISSION_DETAIL',
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
 * POST /api/faculty/submissions/:id/grade
 * Evaluates a student submission, assigning numerical marks and written feedback
 */
export const gradeSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body;

    if (marks === undefined || marks === null || isNaN(marks)) {
      return res.status(400).json({
        success: false,
        message: 'A valid numeric marks score is required.',
      });
    }

    const numericMarks = parseFloat(marks);
    if (numericMarks < 0 || numericMarks > 100) {
      return res.status(400).json({
        success: false,
        message: 'Marks must be a value between 0 and 100.',
      });
    }

    const updated = await SubmissionModel.gradeSubmission({
      id,
      marks: numericMarks,
      feedback: feedback ? feedback.trim() : '',
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found to evaluate.',
      });
    }

    await AuditModel.logAccess({
      userId: req.user.id,
      endpoint: `/api/faculty/submissions/${id}/grade`,
      action: 'FACULTY_GRADE_SUBMISSION',
      result: 'success',
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Submission evaluated and graded successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
