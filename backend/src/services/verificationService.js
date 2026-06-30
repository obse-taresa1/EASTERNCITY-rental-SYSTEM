const userRepository = require('../repositories/userRepository');
const { VERIFICATION_STATUSES } = require('../utils/constants');

function notImplemented(message) {
  const error = new Error(message);
  error.statusCode = 501;
  return error;
}

async function submitVerification(userId, payload) {
  await userRepository.findById(userId);

  throw notImplemented(
    'Verification persistence is not implemented yet. Developer 1 should add verification fields/model before enabling this endpoint.',
  );
}

async function listVerificationRequests() {
  throw notImplemented(
    'Verification request listing is not implemented yet. Developer 1 should connect this to the verification model.',
  );
}

async function reviewVerification(userId, payload, reviewedById) {
  await userRepository.findById(userId);

  if (![VERIFICATION_STATUSES.APPROVED, VERIFICATION_STATUSES.REJECTED].includes(payload.status)) {
    const error = new Error('Invalid verification status.');
    error.statusCode = 400;
    throw error;
  }

  throw notImplemented(
    'Verification review is not implemented yet. Developer 1 should update verification status and audit logs here.',
  );
}

module.exports = {
  submitVerification,
  listVerificationRequests,
  reviewVerification,
};
