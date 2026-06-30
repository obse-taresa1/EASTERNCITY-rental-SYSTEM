const { VERIFICATION_STATUSES } = require('../utils/constants');

function requireVerifiedFileUrl(value, fieldName) {
  if (!value || typeof value !== 'string') {
    return `${fieldName} file URL is required.`;
  }

  if (value.startsWith('data:')) {
    return `${fieldName} must be a file path or URL, not base64 data.`;
  }

  return null;
}

function validateVerificationSubmission(req, res, next) {
  const { nationalIdFrontUrl, nationalIdBackUrl } = req.body;
  const errors = [
    requireVerifiedFileUrl(nationalIdFrontUrl, 'nationalIdFrontUrl'),
    requireVerifiedFileUrl(nationalIdBackUrl, 'nationalIdBackUrl'),
  ].filter(Boolean);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid verification submission.',
      errors,
    });
  }

  next();
}

function validateVerificationDecision(req, res, next) {
  const { status, reason } = req.body;
  const allowedStatuses = [VERIFICATION_STATUSES.APPROVED, VERIFICATION_STATUSES.REJECTED];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Verification status must be APPROVED or REJECTED.',
    });
  }

  if (status === VERIFICATION_STATUSES.REJECTED && (!reason || !reason.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required.',
    });
  }

  next();
}

module.exports = {
  validateVerificationSubmission,
  validateVerificationDecision,
};
