const express = require('express');
const router = express.Router();
const controller = require('../controllers/featuredListingController');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Public endpoints
router.get('/active', controller.getActiveFeatured);

// Admin endpoints
router.get('/', authMiddleware, authorize('ADMIN'), controller.getAllFeatured);
router.post('/', authMiddleware, authorize('ADMIN'), controller.createFeatured);
router.put('/:id', authMiddleware, authorize('ADMIN'), controller.updateFeatured);
router.delete('/:id', authMiddleware, authorize('ADMIN'), controller.deleteFeatured);

module.exports = router;
