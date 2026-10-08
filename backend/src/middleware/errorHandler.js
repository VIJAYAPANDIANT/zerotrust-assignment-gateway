import { config } from '../config/environment.js';

/**
 * 404 Not Found Middleware
 * Intercepts requests that do not match any defined routes.
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Centralized Error-Handling Middleware
 * Catches operational, validation, CORS, and unhandled errors throughout the application.
 */
export const errorHandler = (err, req, res, next) => {
  // 1. Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Malformed JSON payload provided.',
    });
  }

  // 2. Handle Multer file upload errors
  if (err.name === 'MulterError') {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File size exceeds maximum allowed limit (15 MB).'
        : `File upload error: ${err.message}`;
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: msg,
    });
  }

  // 3. Handle CORS origin rejection
  if (err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: err.message,
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const errorNames = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
  };

  // Secure logging on origin server
  if (statusCode >= 500) {
    console.error(`[Server Error ${statusCode}]`, err);
  } else {
    console.warn(`[Client Error ${statusCode}] ${message} (${req.method} ${req.originalUrl})`);
  }

  // In production, mask internal error details from external callers
  const clientMessage =
    config.nodeEnv === 'production' && statusCode === 500
      ? 'An internal server error occurred. Please contact the administrator.'
      : message;

  return res.status(statusCode).json({
    success: false,
    error: err.error || errorNames[statusCode] || 'Error',
    message: clientMessage,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};
