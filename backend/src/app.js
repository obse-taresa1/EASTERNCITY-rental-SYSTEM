// src/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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
