const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/uploadMiddleware');
const controller = require('../controllers/promotionController');
const { validatePromotionRequest } = require('../validators/promotionValidator');

router.get('/', auth, authorize('ADMIN', 'SUPER_ADMIN'), controller.list);
router.post('/', auth, upload.paymentProof, validatePromotionRequest, controller.request);

router.patch('/:id/approve', auth, authorize('ADMIN', 'SUPER_ADMIN'), controller.approve);
router.patch('/:id/reject', auth, authorize('ADMIN', 'SUPER_ADMIN'), controller.reject);

module.exports = router;