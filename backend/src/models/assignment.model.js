import { query } from '../config/db.js';
import crypto from 'crypto';

export const AssignmentModel = {
  /**
   * Retrieve all assignments ordered by deadline
   */
  async findAll() {
    const res = await query(
      `SELECT a.id, a.title, a.description, a.deadline, a.created_by, a.created_at,
              COALESCE(u.name, 'Course Instructor') as faculty_name
       FROM assignments a
       LEFT JOIN users u ON a.created_by = u.id
       ORDER BY a.deadline ASC`
    );
    return res.rows;
  },

  /**
   * Find a specific assignment by UUID
   */
  async findById(id) {
    const res = await query(
      `SELECT a.id, a.title, a.description, a.deadline, a.created_by, a.created_at,
              COALESCE(u.name, 'Course Instructor') as faculty_name
       FROM assignments a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  /**
   * Create an assignment
   */
  async create({ title, description, deadline, createdBy }) {
    const id = crypto.randomUUID();
    const res = await query(
      `INSERT INTO assignments (id, title, description, deadline, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING id, title, description, deadline, created_by, created_at`,
      [id, title, description, deadline, createdBy]
    );
    return res.rows[0];
  },
};
