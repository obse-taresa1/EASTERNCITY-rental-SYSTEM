const repository = require('../repositories/promotionRepository');
const listingRepository = require('../repositories/listingRepository');
const notificationService = require('../services/notificationService');
const {
  withPrivatePromotionMedia,
} = require('./privateMediaService');

const PAYMENT_TYPES = {
  PROMOTION_FEE: 'PROMOTION_FEE',
};

function proofPath(file) {
  return file?.cloudinaryUrl || null;
}

/** Create a promotion request */
async function requestPromotion(userId, payload, file) {
  if (payload.discount !== undefined && payload.discount !== null) {
    if (!Number.isInteger(Number(payload.discount)) || Number(payload.discount) < 0) {
      throw new Error('Discount must be a positive integer');
    }
  }
  const promotion = await repository.create({
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

  return withPrivatePromotionMedia(promotion);
}

async function list(query) {
  const promotions = await repository.findMany();
  return promotions.map(withPrivatePromotionMedia);
}

async function listByUser(userId) {
  const promotions = await repository.findMany({ where: { userId } });
  return promotions.map(withPrivatePromotionMedia);
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

  return merged.map(withPrivatePromotionMedia);
}

async function listPending() {
  const promotions = await repository.findMany({ where: { status: "PENDING" } });
  return promotions.map(withPrivatePromotionMedia);
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

async function fetchActivePromotions() {
  const promotions = await repository.findMany({
    where: { status: "APPROVED" },
    include: {
      listing: {
        include: { images: true, owner: true, category: true },
      },
    },
  });

  return promotions.map((promotion) => ({ ...promotion, paymentProofUrl: null }));
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
