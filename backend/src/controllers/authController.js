// src/controllers/authController.js
const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser(name, email, password);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await authService.refreshSession(req.body.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.revokeRefreshToken(req.body.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logout successful.',
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.requestPasswordReset(req.body.email);

    res.status(200).json({
      success: true,
      message: 'If that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};
