// src/utils/jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}-refresh`;

const generateToken = (payload, expiresIn = '1d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

const generateRefreshToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
