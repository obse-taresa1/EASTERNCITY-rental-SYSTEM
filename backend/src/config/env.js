const dotenv = require('dotenv');

dotenv.config();

const requiredEnv = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

function getEnv(name, fallback = undefined) {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return value;
}

function validateEnv() {
  const missing = requiredEnv.filter((name) => !getEnv(name));

  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    error.statusCode = 500;
    throw error;
  }
}

module.exports = {
  env: {
    nodeEnv: getEnv('NODE_ENV', 'development'),
    port: Number(getEnv('PORT', 5000)),
    databaseUrl: getEnv('DATABASE_URL'),
    jwtSecret: getEnv('JWT_SECRET'),
    jwtRefreshSecret: getEnv('JWT_REFRESH_SECRET'),
    clientUrl: getEnv('CLIENT_URL', 'http://localhost:5173'),
    corsOrigin: getEnv('CORS_ORIGIN', getEnv('CORS_ORIGINS', 'http://localhost:5173')),
  },
  getEnv,
  validateEnv,
};
