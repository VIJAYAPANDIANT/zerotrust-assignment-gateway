import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'zerotrust_assignment_gateway_fallback_secret',
  databaseUrl: process.env.DATABASE_URL || '',
};

// Validate critical security secrets
if (!process.env.JWT_SECRET && config.nodeEnv === 'production') {
  throw new Error('[FATAL] JWT_SECRET must be defined in production environment.');
}
