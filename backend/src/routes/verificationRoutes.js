const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const verificationController = require('../controllers/verificationController');
const {
  validateVerificationSubmission,
  validateVerificationDecision,
} = require('../validators/verificationValidator');

router.use(authMiddleware);

router.post('/me', validateVerificationSubmission, verificationController.submit);
router.get('/requests', authorize('ADMIN', 'SUPER_ADMIN'), verificationController.list);
router.patch(
  '/requests/:userId',
  authorize('ADMIN', 'SUPER_ADMIN'),
  validateVerificationDecision,
  verificationController.review,
);

module.exports = router;
