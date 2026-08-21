const repository = require('../repositories/promotionRepository');
const listingRepository = require('../repositories/listingRepository');
const notificationService = require('../services/notificationService');

const PAYMENT_TYPES = {
  PROMOTION_FEE: 'PROMOTION_FEE',
};

function proofPath(file) {
  if (!file || !file.filename) return null;
  // multer saves to uploads/payments/ — include the subfolder in the URL
  const folder = (file.destination || '').replace(/\\/g, '/').split('/uploads/')[1] || 'payments';
  return `/uploads/${folder}/${file.filename}`;
}

/** Create a promotion request */
async function requestPromotion(userId, payload, file) {
  if (payload.discount !== undefined && payload.discount !== null) {
    if (!Number.isInteger(Number(payload.discount)) || Number(payload.discount) < 0) {
      throw new Error('Discount must be a positive integer');
    }
  }
  return repository.create({
    userId,
    listingId: payload.listingId,
    packageType: payload.packageType,
    placement: payload.placement,
    amount: Number(payload.amount),
    paymentType: PAYMENT_TYPES.PROMOTION_FEE,
    paymentProofUrl: proofPath(file),
    status: "PENDING",
    discount: payload.discount ? Number(payload.discount) : null,
    durationDays: payload.durationDays ? Number(payload.durationDays) : 7,
    customTitle: payload.customTitle || null,
    customSubtitle: payload.customSubtitle || null,
    specs: payload.specs || null,
  });
}

function list(query) {
  return repository.findMany();
}

function listByUser(userId) {
  return repository.findMany({ where: { userId } });
}

/**
 * List promotions for a user, including HeroPromotion records for their listings,
 * so that items that appear in the hero section show up in their history as "APPROVED".
 */
async function listByUserWithHero(userId) {
  const prisma = require('../config/db');

  // 1. Get the user's normal promotion requests
  const normalPromotions = await repository.findMany({ where: { userId } });

  // 2. Get all listings owned by this user
  const userListings = await prisma.listing.findMany({
    where: { ownerId: userId },
    select: { id: true, title: true, images: { take: 1, select: { imageUrl: true } } },
  });
  const userListingIds = new Set(userListings.map(l => l.id));
  const listingById = Object.fromEntries(userListings.map(l => [l.id, l]));

  // 3. Get HeroPromotion records that match the user's listings (using listingId)
  let heroPromos = [];
  if (userListingIds.size > 0) {
    heroPromos = await prisma.heroPromotion.findMany({
      where: { listingId: { in: [...userListingIds] } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 4. Build a set of listingIds that already have a normal HERO_PROMOTION entry
  const coveredListingIds = new Set(
    normalPromotions
      .filter(p => p.placement === 'HERO_PROMOTION')
      .map(p => p.listingId)
  );

  // 5. Convert HeroPromotion records into promotion-shaped objects for ones NOT already covered
  const syntheticPromotions = heroPromos
    .filter(hp => !coveredListingIds.has(hp.listingId))
    .map(hp => {
      const listing = listingById[hp.listingId];
      return {
        id: `hero_${hp.id}`,
        listingId: hp.listingId,
        userId,
        listing: listing
          ? { id: listing.id, title: listing.title, images: listing.images }
          : null,
        packageType: 'Hero Section Promotion',
        placement: 'HERO_PROMOTION',
        amount: hp.originalPrice || 0,
        discount: hp.discountPercent || 0,
        status: 'APPROVED',
        paymentProofUrl: null,
        createdAt: hp.createdAt || hp.startDate || new Date(),
        approvedAt: hp.createdAt || new Date(),
        _isHeroPromotion: true,
      };
    });

  // 6. Merge and sort by date descending
  const merged = [...normalPromotions, ...syntheticPromotions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return merged;
}

function listPending() {
  return repository.findMany({ where: { status: "PENDING" } });
}

/** Approve a promotion request; creates hero promotion if placement is HERO_PROMOTION */
async function approve(id, adminId) {
  const existingPromotion = await repository.findById(id);
  
  const startDate = new Date();
  const duration = existingPromotion?.durationDays || 7;
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + duration);

  const promotion = await repository.update(id, {
    status: "APPROVED",
    approvedById: adminId,
    approvedAt: new Date(),
    startDate,
    endDate,
  });

  // DO NOT mark listing as FEATURED status permanently.
  // The system relies on the Promotion's startDate and endDate.

  const listing = await listingRepository.findById(promotion.listingId);
  await notificationService.notifyPromotionApproved({ ...promotion, listing });

  if (promotion.placement === "HERO_PROMOTION" || promotion.placement === "HERO_SECTION") {
    const heroService = require('../services/heroPromotionService');
    await heroService.createFromPromotion(promotion);
  }

  return promotion;
}

/** Reject a promotion request */
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

async function deletePromotion(id) {
  return repository.delete(id);
}

function fetchActivePromotions() {
  return repository.findMany({
    where: { status: "APPROVED" },
    include: {
      listing: {
        include: { images: true, owner: true, category: true },
      },
    },
  });
}

module.exports = {
  requestPromotion,
  list,
  listByUser,
  listByUserWithHero,
  listPending,
  approve,
  reject,
  fetchActivePromotions,
  deletePromotion,
};
