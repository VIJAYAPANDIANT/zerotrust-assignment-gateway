import { query } from '../config/db.js';
import crypto from 'crypto';

export const UserModel = {
  /**
   * Find a user by email (case-insensitive)
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    const res = await query(
      'SELECT id, name, email, password, role, created_at FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return res.rows[0] || null;
  },

  /**
   * Find a user by unique identifier
   * @param {string} id - UUID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const res = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  },

  /**
   * Create a new user record
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise<Object>} Safe user object without password
   */
  async create({ name, email, password, role }) {
    const id = crypto.randomUUID();
    const res = await query(
      `INSERT INTO users (id, name, email, password, role, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING id, name, email, role, created_at`,
      [id, name, email, password, role]
    );
    return res.rows[0];
  },
};
