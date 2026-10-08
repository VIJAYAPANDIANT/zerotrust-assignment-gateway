import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/environment.js';
import { corsOptions } from './config/cors.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { verifyCloudflareAccess } from './middleware/cloudflareAccess.middleware.js';

// Initialize Express application
const app = express();

// 1. CORS Configuration
app.use(cors(corsOptions));

// 2. JSON Request Body Parsing
app.use(express.json());

// 3. Static Artifacts Directory
app.use('/uploads', express.static(path.resolve('uploads')));

// 4. Cloudflare Access Edge Boundary Verification
app.use(verifyCloudflareAccess);

// 5. API Routes
app.use('/api', apiRoutes);

// 5. 404 Handler for undefined routes
app.use(notFoundHandler);

// 6. Centralized Error-Handling Middleware
app.use(errorHandler);

// 7. Clean Server Startup Process
const server = app.listen(config.port, () => {
  const healthDisplay =
    config.nodeEnv === 'production'
      ? `Port: ${config.port} (/api/health)`
      : `http://localhost:${config.port}/api/health`;

  console.log('====================================================');
  console.log(' ZeroTrust Assignment Gateway API');
  console.log(` Status: Running`);
  console.log(` Port: ${config.port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` Health Check: ${healthDisplay}`);
  console.log('====================================================');
});

// 8. Graceful Shutdown & Unhandled Process Rejection Handlers
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    console.log('Server process terminated cleanly.');
    process.exit(0);
  });

  // Force close after 10s timeout
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
  shutdown('UNCAUGHT_EXCEPTION');
});

export default app;
