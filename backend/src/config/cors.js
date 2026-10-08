import { config } from './environment.js';

/**
 * Production-Ready CORS Configuration
 * Enforces Zero Trust origin verification against authorized domains.
 */
const allowedOrigins = new Set(
  [
    ...config.allowedOrigins,
    config.clientUrl,
    ...(config.nodeEnv === 'development'
      ? ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000']
      : []),
  ].filter(Boolean)
);

export const corsOptions = {
  origin: (origin, callback) => {
    // 1. Allow non-browser requests (e.g. server-to-server, curl, health probes)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Validate against explicit allowed origins whitelist
    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    // 3. In development mode, permit localhost ports
    if (config.nodeEnv === 'development' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // 4. Deny unauthorized cross-origin request
    const corsError = new Error(`Origin '${origin}' not permitted by Zero Trust CORS policy.`);
    corsError.status = 403;
    return callback(corsError);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition'],
  credentials: true,
  maxAge: 86400, // Cache preflight response for 24 hours
};
