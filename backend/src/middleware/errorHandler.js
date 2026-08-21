// src/middleware/errorHandler.js
const { cleanupUploadedFiles } = require('../utils/uploadCleanup');

function isDatabaseConnectivityError(error) {
  return error?.code === 'P1001'
    || /Can't reach database server|database server.*not running/i.test(String(error?.message || ''));
}

/**
 * Global Error Handling Middleware
 * Intercepts all unhandled controller/route errors and returns a formatted JSON response.
 */
const errorHandler = (err, req, res, next) => {
  cleanupUploadedFiles(req);

  console.error('[Error Logger]:', err.stack || err.message || err);

  const databaseUnavailable = isDatabaseConnectivityError(err);
  const statusCode = databaseUnavailable ? 503 : (err.statusCode || 500);
  const message = databaseUnavailable
    ? 'The database is temporarily unavailable. Please wait a moment and try again.'
    : (err.message || 'Internal Server Error');

  res.status(statusCode).json({
    success: false,
    message,
    // Keep implementation details and connection strings out of browser responses.
    stack: undefined,
  });
};

module.exports = errorHandler;
