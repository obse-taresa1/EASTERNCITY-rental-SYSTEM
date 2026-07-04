// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const auditLogger = require('./middleware/auditLogger');
const rateLimit = require('./middleware/rateLimit');
const logger = require('./config/logger');

dotenv.config();

const app = express();

app.use(helmet());

const corsAllowlist = (process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

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
