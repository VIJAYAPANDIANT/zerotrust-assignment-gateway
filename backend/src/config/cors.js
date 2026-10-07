import { config } from './environment.js';

/**
 * CORS Configuration
 * Restricts origin access to authorized client domains.
 */
export const corsOptions = {
  origin: [config.clientUrl, 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
