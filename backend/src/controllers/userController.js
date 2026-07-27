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
 * Update the authenticated user's own profile
 */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile here.',
      });
    }

    delete updateData.role;
    delete updateData.status;
    delete updateData.verificationStatus;
    delete updateData.nationalIdFrontUrl;
    delete updateData.nationalIdBackUrl;

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

const updateProfileImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile image here.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Profile image is required.',
      });
    }

    const updatedUser = await userService.updateProfileImage(
      id,
      `/uploads/profiles/${req.file.filename}`,
    );

    res.status(200).json({
      success: true,
      message: 'Profile image updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  update,
  updateProfileImage,
};
