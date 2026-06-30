// src/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middleware/errorHandler');
const auditLogger = require('./middleware/auditLogger');
const rateLimit = require('./middleware/rateLimit');

// Load environment variables
dotenv.config();

const app = express();

const corsAllowlist = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middlewares
app.use(cors({
  origin(origin, callback) {
    if (!origin || corsAllowlist.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin is not allowed.'));
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit());
app.use(auditLogger);

// Request logger for development environment
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP Request]: ${req.method} ${req.url}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the React Admin Dashboard System API.',
    version: '1.0.0',
  });
});

// Catch-all route for unregistered endpoints (404 Error handler)
app.use((req, res, next) => {
  const error = new Error(`Cannot find ${req.method} ${req.originalUrl} on this server.`);
  error.statusCode = 404;
  next(error);
});

// Global Centralized Error Middleware
app.use(errorHandler);

module.exports = app;


