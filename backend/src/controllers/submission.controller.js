import { SubmissionModel } from '../models/submission.model.js';
import { AssignmentModel } from '../models/assignment.model.js';
import { AuditModel } from '../models/audit.model.js';

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
 * POST /api/submissions
 * Submits coursework for an assignment
 */
export const submitAssignment = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { assignment_id } = req.body;

    if (!assignment_id) {
      return res.status(400).json({
        success: false,
        message: 'assignment_id is required.',
      });
    }

    // Verify assignment exists
    const assignment = await AssignmentModel.findById(assignment_id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.',
      });
    }

    // Determine artifact URL: from uploaded file or from provided file_url
    let fileUrl = req.body.file_url;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Either a submission file or file_url must be provided.',
      });
    }

    // Save submission
    const submission = await SubmissionModel.createOrUpdate({
      assignmentId: assignment_id,
      studentId,
      fileUrl,
    });

    await AuditModel.logAccess({
      userId: studentId,
      endpoint: '/api/submissions',
      action: 'SUBMIT_ASSIGNMENT',
      result: 'success',
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully.',
      data: {
        ...submission,
        assignment_title: assignment.title,
      },
    });
  } catch (error) {
    next(error);
  }
};
