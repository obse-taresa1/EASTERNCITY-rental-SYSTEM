// src/controllers/authController.js
const authService = require('../services/authService');

/**
 * Handle user registration
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Call service to register user
    const result = await authService.registerUser(name, email, password, role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Call service to log in user
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

module.exports = {
  register,
  login,
};
