const express = require('express');
const router = express.Router();
const controller = require('../controllers/heroPromotionController');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Public endpoints
router.get('/active', controller.getActivePromotions);

// Admin endpoints
router.get('/', authMiddleware, authorize('ADMIN'), controller.getAllPromotions);
router.post('/', authMiddleware, authorize('ADMIN'), controller.createPromotion);
router.put('/:id', authMiddleware, authorize('ADMIN'), controller.updatePromotion);
router.delete('/:id', authMiddleware, authorize('ADMIN'), controller.deletePromotion);

module.exports = router;
