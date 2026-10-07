import { config } from '../config/environment.js';

/**
 * 404 Not Found Middleware
 * Intercepts requests that do not match any defined routes.
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Centralized Error-Handling Middleware
 * Catches operational and unhandled errors throughout the application.
 */
export const errorHandler = (err, req, res, next) => {
  // Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload provided',
    });
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File size exceeds maximum allowed limit (15 MB).'
        : `File upload error: ${err.message}`;
    return res.status(400).json({
      success: false,
      message: msg,
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error details for developer diagnostics
  console.error(`[Error] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};
