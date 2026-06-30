// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All user routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/users/profile
 * @desc    Get currently logged-in user profile
 * @access  Private (Authenticated Users)
 */
router.get('/profile', userController.getProfile);
router.get('/me', userController.getProfile);

/**
 * @route   GET /api/users
 * @desc    Get all users list
 * @access  Private (Admin / Super Admin only)
 */
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), userController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get detailed user details by ID
 * @access  Private (Admin / Super Admin only)
 */
router.get('/:id', authorize('ADMIN', 'SUPER_ADMIN'), userController.getUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile data
 * @access  Private (Self, Admin, or Super Admin)
 */
router.put('/:id', userController.update);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user account
 * @access  Private (Admin / Super Admin only)
 */
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), userController.remove);

module.exports = router;

