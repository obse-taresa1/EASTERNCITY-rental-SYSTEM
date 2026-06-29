// src/server.js
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Server is running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`  Local Address: http://localhost:${PORT}`);
  console.log(`=========================================`);
});

// Handle unhandled promise rejections outside Express
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection Warning]: ${err.message}`);
  // In production, we'd log this to an APM and gracefully shut down
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[Uncaught Exception Warning]: ${err.message}`);
  process.exit(1);
});
