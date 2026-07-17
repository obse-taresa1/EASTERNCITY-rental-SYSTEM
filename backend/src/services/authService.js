// src/services/authService.js
const crypto = require('crypto');
const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { sendPasswordResetEmail } = require('./emailService');
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function addDays(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function addMinutes(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

function getClientUrl() {
  return process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
}

function publicUser(user) {
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function createSession(user) {
  if (String(user.status || 'ACTIVE').toUpperCase() === 'SUSPENDED') {
    const error = new Error('Account is suspended.');
    error.statusCode = 403;
    throw error;
  }

  const accessToken = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({ id: user.id }, '7d');

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: addDays(7),
    },
  });

  return {
    user: publicUser(user),
    token: accessToken,
    accessToken,
    refreshToken,
  };
}

const registerUser = async (name, email, password) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    const error = new Error('Email is already registered.');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'USER',
    },
  });

  return createSession(user);
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  return createSession(user);
};

const refreshSession = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error('Refresh token is required.');
    error.statusCode = 400;
    throw error;
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded?.id) {
    const error = new Error('Invalid or expired refresh token.');
    error.statusCode = 401;
    throw error;
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!storedToken || storedToken.revokedAt) {
    const error = new Error('Refresh token has been revoked.');
    error.statusCode = 401;
    throw error;
  }

  if (storedToken.expiresAt <= new Date()) {
    const error = new Error('Refresh token has expired.');
    error.statusCode = 401;
    throw error;
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  return createSession(storedToken.user);
};

const revokeRefreshToken = async (refreshToken) => {
  if (!refreshToken) return null;

  const tokenHash = hashRefreshToken(refreshToken);
  return prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    const error = new Error('Current password is incorrect.');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
};

const requestPasswordReset = async (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    return;
  }

  await prisma.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(resetToken);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: addMinutes(30),
    },
  });

  const resetUrl = `${getClientUrl().replace(/\/$/, '')}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail({
    to: user.email,
    resetUrl,
  });
};

const resetPassword = async (token, newPassword) => {
  const tokenHash = hashResetToken(token);
  const storedToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!storedToken || storedToken.usedAt || storedToken.expiresAt <= new Date()) {
    const error = new Error('Password reset link is invalid or expired.');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: storedToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.refreshToken.updateMany({
      where: {
        userId: storedToken.userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    }),
  ]);
};

module.exports = {
  registerUser,
  loginUser,
  refreshSession,
  revokeRefreshToken,
  changePassword,
  requestPasswordReset,
  resetPassword,
};
