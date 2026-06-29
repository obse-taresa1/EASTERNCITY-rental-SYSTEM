// src/services/userService.js
const prisma = require('../config/db');
const { hashPassword } = require('../utils/hash');

/**
 * Fetch all users from the database (passwords excluded)
 * @returns {Promise<Array>} List of users
 */
const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

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

  // If password is being updated, hash it
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  // Ensure email uniqueness check if email is updated
  if (updateData.email) {
    const existing = await prisma.user.findUnique({
      where: { email: updateData.email },
    });
    if (existing && existing.id !== id) {
      const error = new Error('Email is already in use by another user.');
      error.statusCode = 400;
      throw error;
    }
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

/**
 * Delete a user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object>} Deleted user record info
 */
const deleteUser = async (id) => {
  await getUserById(id);

  return prisma.user.delete({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
