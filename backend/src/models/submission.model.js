import { query } from '../config/db.js';
import crypto from 'crypto';

export const SubmissionModel = {
  /**
   * Find all submissions made by a specific student
   */
  async findByStudentId(studentId) {
    const res = await query(
      `SELECT s.id, s.assignment_id, s.student_id, s.file_url, s.submitted_at, s.status, s.marks, s.feedback,
              a.title as assignment_title, a.deadline as assignment_deadline
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.student_id = $1
       ORDER BY s.submitted_at DESC`,
      [studentId]
    );
    return res.rows;
  },

  /**
   * Find an existing submission by assignment and student
   */
  async findByAssignmentAndStudent(assignmentId, studentId) {
    const res = await query(
      `SELECT s.id, s.assignment_id, s.student_id, s.file_url, s.submitted_at, s.status, s.marks, s.feedback
       FROM submissions s
       WHERE s.assignment_id = $1 AND s.student_id = $2`,
      [assignmentId, studentId]
    );
    return res.rows[0] || null;
  },

  /**
   * Create or update a student submission
   */
  async createOrUpdate({ assignmentId, studentId, fileUrl }) {
    const id = crypto.randomUUID();
    const res = await query(
      `INSERT INTO submissions (id, assignment_id, student_id, file_url, submitted_at, status)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'submitted')
       ON CONFLICT (assignment_id, student_id)
       DO UPDATE SET
         file_url = EXCLUDED.file_url,
         submitted_at = CURRENT_TIMESTAMP,
         status = 'resubmitted'
       RETURNING id, assignment_id, student_id, file_url, submitted_at, status, marks, feedback`,
      [id, assignmentId, studentId, fileUrl]
    );
    return res.rows[0];
  },
  /**
   * Find all submissions for assignments created by a faculty member
   */
  async findByFaculty(facultyId) {
    const res = await query(
      `SELECT s.id, s.assignment_id, s.student_id, s.file_url, s.submitted_at, s.status, s.marks, s.feedback,
              u.name as student_name, u.email as student_email,
              a.title as assignment_title, a.deadline as assignment_deadline
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN users u ON s.student_id = u.id
       WHERE a.created_by = $1
       ORDER BY s.submitted_at DESC`,
      [facultyId]
    );
    return res.rows;
  },

  /**
   * Find submission by ID with full student and assignment details
   */
  async findByIdWithDetails(id) {
    const res = await query(
      `SELECT s.id, s.assignment_id, s.student_id, s.file_url, s.submitted_at, s.status, s.marks, s.feedback,
              u.name as student_name, u.email as student_email,
              a.title as assignment_title, a.description as assignment_description,
              a.deadline as assignment_deadline, a.created_by
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN users u ON s.student_id = u.id
       WHERE s.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  /**
   * Grade a submission and record feedback
   */
  async gradeSubmission({ id, marks, feedback }) {
    const res = await query(
      `UPDATE submissions
       SET marks = $1, feedback = $2, status = 'graded'
       WHERE id = $3
       RETURNING id, assignment_id, student_id, file_url, submitted_at, status, marks, feedback`,
      [marks, feedback || null, id]
    );
    return res.rows[0] || null;
  },
};
