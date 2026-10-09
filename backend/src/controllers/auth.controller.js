import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { UserModel } from '../models/user.model.js';
import { AuditModel } from '../models/audit.model.js';

/**
 * Generate a signed JWT
 * Payload contains: user id, email, role
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: '24h',
    }
  );
};

/**
 * POST /api/auth/register
 * Registers a new student or faculty member.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, password, role) are required.',
      });
    }

    // 2. Enforce allowed roles and disallow self-registration as admin
    const normalizedRole = role.toLowerCase().trim();
    if (normalizedRole === 'admin') {
      await AuditModel.logAccess({
        endpoint: '/api/auth/register',
        action: 'UNAUTHORIZED_API_ATTEMPT',
        result: 'BLOCK',
        ipAddress: req.ip,
      });

      return res.status(403).json({
        success: false,
        message: 'Self-registration as administrator is strictly prohibited.',
      });
    }

    if (!['student', 'faculty'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Allowed roles are "student" or "faculty".',
      });
    }

    // 3. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // 4. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // 5. Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // 6. Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 7. Insert new user
    const newUser = await UserModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: normalizedRole,
    });

    // 8. Generate JWT
    const token = generateToken(newUser);

    // 9. Audit log
    await AuditModel.logAccess({
      userId: newUser.id,
      endpoint: '/api/auth/register',
      action: 'REGISTER',
      result: 'success',
      ipAddress: req.ip,
    });

    // 10. Return response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticates user credentials and issues a JWT.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // 2. Fetch user by email
    const user = await UserModel.findByEmail(email.trim());
    if (!user) {
      await AuditModel.logAccess({
        endpoint: '/api/auth/login',
        action: 'LOGIN_FAILURE',
        result: 'FAILURE',
        ipAddress: req.ip,
      });

      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    // 3. Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await AuditModel.logAccess({
        userId: user.id,
        endpoint: '/api/auth/login',
        action: 'LOGIN_FAILURE',
        result: 'FAILURE',
        ipAddress: req.ip,
      });

      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    // 4. Generate JWT
    const token = generateToken(user);

    // 5. Audit log
    await AuditModel.logAccess({
      userId: user.id,
      endpoint: '/api/auth/login',
      action: 'LOGIN_SUCCESS',
      result: 'ALLOW',
      ipAddress: req.ip,
    });

    // 6. Return response
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Logs out the user session.
 */
export const logout = async (req, res, next) => {
  try {
    let userId = req.user?.id || null;

    if (!userId && req.headers?.authorization && req.headers.authorization.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1].trim();
        const decoded = jwt.verify(token, config.jwtSecret);
        if (decoded?.id) {
          userId = decoded.id;
        }
      } catch {
        // Token may be invalid or expired, continue logging logout
      }
    }

    await AuditModel.logAccess({
      userId,
      endpoint: '/api/auth/logout',
      action: 'LOGOUT',
      result: 'ALLOW',
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Retrieves the currently authenticated user's profile.
 */
export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully.',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 * Initiates password recovery for a pre-enrolled user.
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your institutional email address.',
      });
    }

    const user = await UserModel.findByEmail(email.trim());
    if (!user) {
      await AuditModel.logAccess({
        endpoint: '/api/auth/forgot-password',
        action: 'FORGOT_PASSWORD_NOT_FOUND',
        result: 'BLOCK',
        ipAddress: req.ip,
      });

      return res.status(404).json({
        success: false,
        message: 'No institutional account found with this email address.',
      });
    }

    await AuditModel.logAccess({
      userId: user.id,
      endpoint: '/api/auth/forgot-password',
      action: 'FORGOT_PASSWORD_VERIFIED',
      result: 'ALLOW',
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: `Identity verified for ${user.name} (${user.role.toUpperCase()}). You may now reset your password.`,
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 * Updates the password for a verified pre-enrolled user.
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const user = await UserModel.findByEmail(email.trim());
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.',
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await UserModel.updatePassword(user.email, hashedPassword);

    await AuditModel.logAccess({
      userId: user.id,
      endpoint: '/api/auth/reset-password',
      action: 'PASSWORD_RESET_SUCCESS',
      result: 'ALLOW',
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: 'Password successfully updated. You may now log in.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/directory
 * Public/institutional directory of pre-registered accounts for demo evaluation
 */
export const getDirectory = async (req, res, next) => {
  try {
    const allUsers = await UserModel.listAll();
    const students = allUsers.filter((u) => u.role === 'student');
    const faculty = allUsers.filter((u) => u.role === 'faculty');
    const admins = allUsers.filter((u) => u.role === 'admin');

    return res.status(200).json({
      success: true,
      data: {
        counts: {
          total: allUsers.length,
          students: students.length,
          faculty: faculty.length,
          admins: admins.length,
        },
        students,
        faculty,
        admins,
      },
    });
  } catch (error) {
    next(error);
  }
};
