const repository = require('../repositories/promotionRepository');
const { PAYMENT_TYPES } = require('../utils/constants');

function proofPath(file) {
  return file ? `/uploads/payments/${file.filename}` : '';
}

function requestPromotion(userId, payload, file) {
  return repository.create({
    userId,
    listingId: payload.listingId,
    packageType: payload.packageType,
    placement: payload.placement,
    amount: Number(payload.amount),
    paymentType: PAYMENT_TYPES.PROMOTION_FEE,
    paymentProofUrl: proofPath(file),
    status: 'PENDING',
  });
}

function list(query) {
  return repository.findMany();
}

function approve(id, adminId) {
  return repository.update(id, {
    status: 'APPROVED',
    approvedById: adminId,
    approvedAt: new Date(),
  });
}

function reject(id, reason, adminId) {
  return repository.update(id, {
    status: 'REJECTED',
    rejectionReason: reason || 'Rejected by admin.',
    approvedById: adminId,
    approvedAt: new Date(),
  });
}

module.exports = {
  requestPromotion,
  list,
  approve,
  reject,
};