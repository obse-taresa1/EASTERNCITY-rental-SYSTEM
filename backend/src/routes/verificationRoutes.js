const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const verificationController = require('../controllers/verificationController');
const { verificationDocuments } = require('../middleware/uploadMiddleware');
const {
  validateVerificationSubmission,
  validateVerificationDecision,
} = require('../validators/verificationValidator');

router.use(authMiddleware);

router.post(
  '/me',
  verificationDocuments,
  validateVerificationSubmission,
  verificationController.submit,
);
router.get('/requests', authorize('ADMIN', 'SUPER_ADMIN'), verificationController.list);
router.patch(
  '/requests/:userId',
  authorize('ADMIN', 'SUPER_ADMIN'),
  validateVerificationDecision,
  verificationController.review,
);

module.exports = router;
