// src/services/userService.js
const prisma = require('../config/db');
const { hashPassword } = require('../utils/hash');

const USER_UPDATE_FIELDS = new Set([
  'name',
  'email',
  'password',
  'role',
  'status',
  'phone',
  'city',
  'sefer',
  'address',
  'profileImageUrl',
]);

function pickUserUpdateFields(updateData = {}) {
  return Object.fromEntries(
    Object.entries(updateData).filter(([key]) => USER_UPDATE_FIELDS.has(key)),
  );
}

/**
 * Fetch a single user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} User object
 */
const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      verificationStatus: true,
      city: true,
      nationalIdFrontUrl: true,
      nationalIdBackUrl: true,
      profileImageUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Update user details
 * @param {string} id - User ID
 * @param {Object} updateData - Object containing fields to update
 * @returns {Promise<Object>} Updated user profile
 */
const updateUser = async (id, updateData) => {
  // Check if user exists
  await getUserById(id);
  const safeUpdateData = pickUserUpdateFields(updateData);

  // If password is being updated, hash it
  if (safeUpdateData.password) {
    safeUpdateData.password = await hashPassword(safeUpdateData.password);
  }

  // Ensure email uniqueness check if email is updated
  if (safeUpdateData.email) {
    const existing = await prisma.user.findUnique({
      where: { email: safeUpdateData.email },
    });
    if (existing && existing.id !== id) {
      const error = new Error('Email is already in use by another user.');
      error.statusCode = 400;
      throw error;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: safeUpdateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      verificationStatus: true,
      city: true,
      nationalIdFrontUrl: true,
      nationalIdBackUrl: true,
      profileImageUrl: true,
      createdAt: true,
    },
  });

  if (safeUpdateData.status === 'SUSPENDED') {
    await prisma.refreshToken.updateMany({
      where: {
        userId: id,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  return updatedUser;
};

const updateProfileImage = async (id, profileImageUrl) => {
  await getUserById(id);

  return prisma.user.update({
    where: { id },
    data: { profileImageUrl },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      verificationStatus: true,
      city: true,
      nationalIdFrontUrl: true,
      nationalIdBackUrl: true,
      profileImageUrl: true,
      createdAt: true,
    },
  });
};

module.exports = {
  getUserById,
  updateUser,
  updateProfileImage,
};
