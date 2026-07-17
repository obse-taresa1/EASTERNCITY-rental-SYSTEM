// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const auditLogger = require('./middleware/auditLogger');
const rateLimit = require('./middleware/rateLimit');
const logger = require('./config/logger');

dotenv.config();

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

const defaultCorsOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const corsAllowlist = [
  ...(process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
    .filter(Boolean),
  ...defaultCorsOrigins,
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || corsAllowlist.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin is not allowed.'));
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(rateLimit());
app.use(auditLogger);

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    logger.info('HTTP request', { method: req.method, url: req.url });
    next();
  });
}

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the EasternCity Rental System API.',
    version: '1.0.0',
  });
});

app.use((req, res, next) => {
  const error = new Error(`Cannot find ${req.method} ${req.originalUrl} on this server.`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

module.exports = app;
