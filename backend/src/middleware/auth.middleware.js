import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { UserModel } from '../models/user.model.js';
import { AuditModel } from '../models/audit.model.js';

/**
 * Reusable Authentication Middleware: requireAuth
 *
 * 1. Reads JWT from Authorization header (Bearer schema)
 * 2. Cryptographically verifies JWT using JWT_SECRET
 * 3. Identifies the user from the database
 * 4. Attaches user info to req.user
 * 5. Rejects missing, invalid, or expired tokens with 401 Unauthorized
 */
export const requireAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1].trim();
    } else if (req.query && req.query.token) {
      token = req.query.token.trim();
    }

    if (!token) {
      await AuditModel.logAccess({
        userId: null,
        endpoint: req.originalUrl,
        action: 'UNAUTHORIZED_API_ATTEMPT',
        result: 'FAILURE',
        ipAddress: req.ip,
      });

      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required. No token provided.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      await AuditModel.logAccess({
        userId: null,
        endpoint: req.originalUrl,
        action: 'UNAUTHORIZED_API_ATTEMPT',
        result: 'FAILURE',
        ipAddress: req.ip,
      });

      const message =
        err.name === 'TokenExpiredError'
          ? 'Token has expired. Please log in again.'
          : 'Invalid authentication token.';

      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message,
      });
    }

    // Verify user exists in database
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Attach user information to request object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
