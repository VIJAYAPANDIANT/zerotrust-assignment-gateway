import { AssignmentModel } from '../models/assignment.model.js';
import { SubmissionModel } from '../models/submission.model.js';
import { AuditModel } from '../models/audit.model.js';

/**
 * GET /api/assignments
 * Retrieves all available assignments
 */
export const getAssignments = async (req, res, next) => {
  try {
    const assignments = await AssignmentModel.findAll();

    // If a student requested, augment with their submission status
    let data = assignments;
    if (req.user && req.user.role === 'student') {
      const mySubmissions = await SubmissionModel.findByStudentId(req.user.id);
      const submissionMap = new Map(
        mySubmissions.map((s) => [s.assignment_id, s])
      );

      data = assignments.map((a) => {
        const sub = submissionMap.get(a.id);
        return {
          ...a,
          submission_status: sub ? sub.status : 'not_submitted',
          my_submission: sub || null,
        };
      });
    }

    await AuditModel.logAccess({
      userId: req.user?.id || null,
      endpoint: '/api/assignments',
      action: 'VIEW_ASSIGNMENTS',
      result: 'ALLOW',
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/assignments/:id
 * Retrieves details for a specific assignment
 */
export const getAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const assignment = await AssignmentModel.findById(id);

    if (!assignment) {
      await AuditModel.logAccess({
        userId: req.user?.id || null,
        endpoint: `/api/assignments/${id}`,
        action: 'VIEW_ASSIGNMENT',
        result: 'FAILURE',
        ipAddress: req.ip,
      });

      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Assignment not found.',
      });
    }

    // Attach student's submission if applicable
    let data = { ...assignment };
    if (req.user && req.user.role === 'student') {
      const mySub = await SubmissionModel.findByAssignmentAndStudent(
        id,
        req.user.id
      );
      data.my_submission = mySub;
      data.submission_status = mySub ? mySub.status : 'not_submitted';
    }

    await AuditModel.logAccess({
      userId: req.user?.id || null,
      endpoint: `/api/assignments/${id}`,
      action: 'VIEW_ASSIGNMENT',
      result: 'ALLOW',
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/assignments
 * Creates a new coursework assignment (Faculty only)
 */
export const createAssignment = async (req, res, next) => {
  try {
    const { title, description, deadline } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Assignment title and deadline are required.',
      });
    }

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid deadline format. Please provide a valid date.',
      });
    }

    const assignment = await AssignmentModel.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      deadline: parsedDeadline.toISOString(),
      createdBy: req.user.id,
    });

    await AuditModel.logAccess({
      userId: req.user.id,
      endpoint: '/api/assignments',
      action: 'CREATE_ASSIGNMENT',
      result: 'ALLOW',
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully.',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};
