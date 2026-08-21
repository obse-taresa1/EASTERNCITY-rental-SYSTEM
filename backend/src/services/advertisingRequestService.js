const crypto = require("crypto");
const prisma = require("../config/db");
const logger = require("../config/logger");
const { sendAdvertisingRequestEmails, sendAdvertisingStatusEmail } = require("./emailService");
const { createBannerAd } = require("./bannerAdService");

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function reference() {
  return `EC-AD-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

async function create(payload, file) {
  if (!file) {
    const error = new Error("A homepage banner image is required for an advertising campaign.");
    error.statusCode = 400;
    throw error;
  }
  const request = await prisma.advertisingRequest.create({
    data: {
      reference: reference(),
      ...payload,
      website: payload.website || null,
      socialMedia: payload.socialMedia || null,
      campaignGoal: payload.campaignGoal || null,
      preferredStartDate: toDate(payload.preferredStartDate),
      preferredEndDate: toDate(payload.preferredEndDate),
      bannerUrl: file ? `/uploads/advertising-requests/${file.filename}` : null,
      termsAccepted: true,
    },
  });

  // Emails are now only sent when an admin updates the status or contacts the user.
  return request;
}

function list(status) {
  return prisma.advertisingRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

async function update(id, payload, actor) {
  const existing = await prisma.advertisingRequest.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error("Advertising request was not found.");
    error.statusCode = 404;
    throw error;
  }
  if (payload.status === "PAID") {
    if (!existing.paymentProofUrl) {
      const error = new Error("A payment receipt must be uploaded before marking this campaign as paid.");
      error.statusCode = 400;
      throw error;
    }
  }
  if (payload.status === "APPROVED" && existing.status !== "APPROVED" && !existing.bannerUrl) {
    const error = new Error("Upload a banner image with the campaign request before approving it for the Home page.");
    error.statusCode = 400;
    throw error;
  }
  if (payload.status === "APPROVED" && existing.status !== "APPROVED" && !existing.paymentProofUrl) {
    const error = new Error("A payment receipt must be uploaded and reviewed before approving this campaign.");
    error.statusCode = 400;
    throw error;
  }
  const updated = await prisma.advertisingRequest.update({
    where: { id },
    data: { ...payload, reviewedAt: new Date() },
  });
  if (payload.status === "APPROVED" && existing.status !== "APPROVED") {
    await createBannerAd(actor, {
      title: updated.companyName,
      companyName: updated.companyName,
      subtitle: (updated.campaignMessage || updated.campaignGoal || "").slice(0, 140),
      imageUrl: updated.bannerUrl,
      ctaLabel: "Explore now",
      ctaUrl: updated.website || "",
      startDate: updated.preferredStartDate ? updated.preferredStartDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      endDate: updated.preferredEndDate ? updated.preferredEndDate.toISOString().slice(0, 10) : "",
      isActive: "true",
      status: "ACTIVE",
    });
  }
  await sendAdvertisingStatusEmail(updated).catch((error) => logger.warn("Advertising status email failed", { id, error: error.message }));
  return updated;
}

async function uploadReceipt(reference, email, file) {
  const request = await prisma.advertisingRequest.findUnique({ where: { reference } });
  if (!request || String(request.email).toLowerCase() !== String(email).trim().toLowerCase()) {
    const error = new Error("We could not find an advertising request with that reference and email.");
    error.statusCode = 404;
    throw error;
  }
  if (request.status !== "WAITING_PAYMENT") {
    const error = new Error("Payment receipt upload is available after the advertising team requests payment.");
    error.statusCode = 400;
    throw error;
  }
  if (!file) {
    const error = new Error("Upload a payment receipt before submitting.");
    error.statusCode = 400;
    throw error;
  }
  return prisma.advertisingRequest.update({
    where: { id: request.id },
    data: { paymentProofUrl: `/uploads/payments/${file.filename}`, paymentSubmittedAt: new Date() },
  });
}

async function getPaymentStatus(reference, email) {
  const request = await prisma.advertisingRequest.findUnique({ where: { reference } });
  if (!request || String(request.email).toLowerCase() !== String(email).trim().toLowerCase()) {
    const error = new Error("We could not find an advertising request with that reference and email.");
    error.statusCode = 404;
    throw error;
  }
  return {
    reference: request.reference,
    status: request.status,
    adminNote: request.status === "WAITING_PAYMENT" ? request.adminNote : null,
    canUploadReceipt: request.status === "WAITING_PAYMENT" && !request.paymentProofUrl,
    receiptUploaded: Boolean(request.paymentProofUrl),
    receiptReviewPending: request.status === "WAITING_PAYMENT" && Boolean(request.paymentProofUrl),
  };
}

async function expireCampaigns() {
  await prisma.advertisingRequest.updateMany({
    where: { status: "APPROVED", preferredEndDate: { lt: new Date() } },
    data: { status: "COMPLETED" },
  });
}

module.exports = { create, list, update, getPaymentStatus, uploadReceipt, expireCampaigns };
