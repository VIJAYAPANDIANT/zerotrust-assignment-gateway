import { config } from '../config/environment.js';

/**
 * Health Check Controller (GET /api/health)
 * Reports runtime operational status, uptime, and environment.
 */
export const getHealth = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'ZeroTrust Assignment Gateway API is running',
    environment: config.nodeEnv,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};
