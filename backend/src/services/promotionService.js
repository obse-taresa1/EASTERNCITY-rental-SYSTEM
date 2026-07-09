const repository = require("../repositories/promotionRepository");
const listingRepository = require("../repositories/listingRepository");
const notificationService = require("./notificationService");
const { PAYMENT_TYPES } = require("../utils/constants");

function proofPath(file) {
  return file ? `/uploads/payments/${file.filename}` : "";
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
    status: "PENDING",
  });
}

function list(query) {
  return repository.findMany();
}

function listPending() {
  return repository.findMany({
    where: { status: "PENDING" },
  });
}

async function approve(id, adminId) {
  const promotion = await repository.update(id, {
    status: "APPROVED",
    approvedById: adminId,
    approvedAt: new Date(),
  });

  await listingRepository.update(promotion.listingId, {
    status: "FEATURED",
  });

  const listing = await listingRepository.findById(promotion.listingId);
  await notificationService.notifyPromotionApproved({ ...promotion, listing });

  return promotion;
}

async function reject(id, reason, adminId) {
  const promotion = await repository.update(id, {
    status: "REJECTED",
    rejectionReason: reason || "Rejected by admin.",
    approvedById: adminId,
    approvedAt: new Date(),
  });

  await notificationService.notifyPromotionRejected(promotion);

  return promotion;
}

module.exports = {
  requestPromotion,
  list,
  listPending,
  approve,
  reject,
};
