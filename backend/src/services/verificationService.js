const prisma = require('../config/db');
const userRepository = require('../repositories/userRepository');
const { VERIFICATION_STATUSES } = require('../utils/constants');

const USER_VERIFICATION_STATUSES = Object.freeze({
  NOT_VERIFIED: 'NOT_VERIFIED',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
});

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function includeRelations() {
  return {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
    reviewedBy: {
      select: {
        id: true,
        name: true,
      },
    },
  };
}

function getUploadedFile(files, fieldName) {
  return files?.[fieldName]?.[0] || null;
}

function toUploadUrl(file) {
  return file ? `/uploads/verification/${file.filename}` : null;
}

function mapVerificationRequest(request) {
  if (!request) return null;

  return {
    id: request.id,
    userId: request.userId,
    userName: request.user?.name || '',
    userEmail: request.user?.email || '',
    userRole: request.user?.role || 'USER',
    city: request.city,
    sefer: request.sefer,
    address: request.address || '',
    nationalIdFrontUrl: request.nationalIdFrontUrl,
    nationalIdBackUrl: request.nationalIdBackUrl,
    status: request.status,
    rejectionReason: request.rejectionReason || '',
    reviewedById: request.reviewedById || '',
    reviewedByName: request.reviewedBy?.name || '',
    reviewedAt: request.reviewedAt,
    submittedAt: request.createdAt,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

function normalizeRequestStatus(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === USER_VERIFICATION_STATUSES.APPROVED) {
    return VERIFICATION_STATUSES.APPROVED;
  }
  if (normalized === USER_VERIFICATION_STATUSES.REJECTED) {
    return VERIFICATION_STATUSES.REJECTED;
  }
  return VERIFICATION_STATUSES.PENDING;
}

function normalizeUserVerificationStatus(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === VERIFICATION_STATUSES.APPROVED) {
    return USER_VERIFICATION_STATUSES.APPROVED;
  }
  if (normalized === VERIFICATION_STATUSES.REJECTED) {
    return USER_VERIFICATION_STATUSES.REJECTED;
  }
  return USER_VERIFICATION_STATUSES.PENDING;
}

async function findReviewTarget(identifier) {
  const byRequestId = await prisma.verificationRequest.findUnique({
    where: { id: identifier },
    include: includeRelations(),
  });

  if (byRequestId) return byRequestId;

  return prisma.verificationRequest.findFirst({
    where: { userId: identifier },
    include: includeRelations(),
    orderBy: { createdAt: 'desc' },
  });
}

async function submitVerification(userId, payload, files = {}) {
  await userRepository.findById(userId);

  const nationalIdFront = getUploadedFile(files, 'nationalIdFront');
  const nationalIdBack = getUploadedFile(files, 'nationalIdBack');

  if (!nationalIdFront || !nationalIdBack) {
    throw createError('Both National ID front and back images are required.');
  }

  const city = String(payload.city || '').trim();
  const sefer = String(payload.sefer || '').trim();
  const address = String(payload.address || '').trim();

  if (!city || !sefer) {
    throw createError('City and sefer are required.');
  }

  const nationalIdFrontUrl = toUploadUrl(nationalIdFront);
  const nationalIdBackUrl = toUploadUrl(nationalIdBack);

  const request = await prisma.$transaction(async (tx) => {
    await tx.verificationRequest.updateMany({
      where: {
        userId,
        status: VERIFICATION_STATUSES.PENDING,
      },
      data: {
        status: VERIFICATION_STATUSES.REJECTED,
        rejectionReason: 'Replaced by a newer verification request.',
      },
    });

    const created = await tx.verificationRequest.create({
      data: {
        userId,
        city,
        sefer,
        address,
        nationalIdFrontUrl,
        nationalIdBackUrl,
        status: VERIFICATION_STATUSES.PENDING,
      },
      include: includeRelations(),
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        city,
        sefer,
        address,
        nationalIdFrontUrl,
        nationalIdBackUrl,
        verificationStatus: USER_VERIFICATION_STATUSES.PENDING,
      },
    });

    return created;
  });

  return mapVerificationRequest(request);
}

async function listVerificationRequests() {
  const requests = await prisma.verificationRequest.findMany({
    include: includeRelations(),
    orderBy: { createdAt: 'desc' },
  });

  return requests.map(mapVerificationRequest);
}

async function reviewVerification(identifier, payload, reviewedById) {
  const request = await findReviewTarget(identifier);

  if (!request) {
    throw createError('Verification request not found.', 404);
  }

  if (![VERIFICATION_STATUSES.APPROVED, VERIFICATION_STATUSES.REJECTED].includes(payload.status)) {
    throw createError('Invalid verification status.');
  }

  const status = normalizeRequestStatus(payload.status);
  const userStatus = normalizeUserVerificationStatus(status);
  const rejectionReason =
    status === VERIFICATION_STATUSES.REJECTED
      ? String(payload.reason || '').trim()
      : '';

  const updated = await prisma.$transaction(async (tx) => {
    const reviewedRequest = await tx.verificationRequest.update({
      where: { id: request.id },
      data: {
        status,
        rejectionReason,
        reviewedById,
        reviewedAt: new Date(),
      },
      include: includeRelations(),
    });

    await tx.user.update({
      where: { id: request.userId },
      data: {
        city: request.city,
        sefer: request.sefer,
        address: request.address,
        nationalIdFrontUrl: request.nationalIdFrontUrl,
        nationalIdBackUrl: request.nationalIdBackUrl,
        verificationStatus: userStatus,
      },
    });

    return reviewedRequest;
  });

  return mapVerificationRequest(updated);
}

module.exports = {
  submitVerification,
  listVerificationRequests,
  reviewVerification,
};
