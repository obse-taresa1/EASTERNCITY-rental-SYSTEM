// src/middleware/errorHandler.js

/**
 * Global Error Handling Middleware
 * Intercepts all unhandled controller/route errors and returns a formatted JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error Logger]:', err.stack || err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
