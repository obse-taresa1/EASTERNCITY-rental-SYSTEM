// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const { validateUpdateUser } = require('../validators/userValidator');

// All user routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/users/profile
 * @desc    Get currently logged-in user profile
 * @access  Private (Authenticated Users)
 */
router.get('/profile', userController.getProfile);
router.get('/me', userController.getProfile);

router.put('/:id/profile-image', upload.profileImage, userController.updateProfileImage);

/**
 * @route   PUT /api/users/:id
 * @desc    Update own profile data
 * @access  Private (Self only)
 */
router.put('/:id', validateUpdateUser, userController.update);

module.exports = router;
