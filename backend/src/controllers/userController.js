// src/controllers/userController.js
const userService = require('../services/userService');

/**
 * Get profile of the currently logged-in user
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await userService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users list (for Admin/Super Admin dashboard)
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get details of a specific user by ID (Admin/Super Admin only)
 */
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a user (Self, Admin, or Super Admin)
 */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Security check: regular users can only update themselves
    if (req.user.role === 'USER' && req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.',
      });
    }

    const updatedUser = await userService.updateUser(id, updateData);

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user (Admin/Super Admin only)
 */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting oneself
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account from here.',
      });
    }

    const deletedInfo = await userService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
      data: deletedInfo,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getUsers,
  getUser,
  update,
  remove,
};
