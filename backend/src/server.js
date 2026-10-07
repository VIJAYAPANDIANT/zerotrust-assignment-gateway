import express from 'express';
import cors from 'cors';
import { config } from './config/environment.js';
import { corsOptions } from './config/cors.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Initialize Express application
const app = express();

// 1. CORS Configuration
app.use(cors(corsOptions));

// 2. JSON Request Body Parsing
app.use(express.json());

// 3. API Routes
app.use('/api', apiRoutes);

// 4. 404 Handler for undefined routes
app.use(notFoundHandler);

// 5. Centralized Error-Handling Middleware
app.use(errorHandler);

// 6. Clean Server Startup Process
const server = app.listen(config.port, () => {
  console.log('====================================================');
  console.log(' ZeroTrust Assignment Gateway API');
  console.log(` Status: Running`);
  console.log(` Port: ${config.port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` Health Check: http://localhost:${config.port}/api/health`);
  console.log('====================================================');
});

// Handle graceful shutdown
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    console.log('Server process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
