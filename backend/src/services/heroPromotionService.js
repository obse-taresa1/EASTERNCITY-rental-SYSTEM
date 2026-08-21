const listingRepository = require('../repositories/listingRepository');
const heroPromotionRepository = require('../repositories/heroPromotionRepository');

/**
 * Calculate discounted price based on original price and discount percent.
 * Returns null if original price is not a valid number or discount is 0.
 */
function calculateDiscountedPrice(originalPrice, discountPercent) {
  const price = Number(originalPrice);
  const discount = Number(discountPercent);
  if (!price || discount <= 0) return null;
  const discounted = price * (1 - discount / 100);
  return Math.round(discounted * 100) / 100;
}

/**
 * Create a HeroPromotion record from an approved promotion.
 * Prevents duplicate hero promotions for the same listing.
 * @param {Object} promotion - The promotion record (already approved).
 * @returns {Promise<Object>} The created or existing HeroPromotion record.
 */
async function createFromPromotion(promotion) {
  if (!promotion || !promotion.listingId) {
    throw new Error('Invalid promotion data');
  }
  const listing = await listingRepository.findById(promotion.listingId);
  if (!listing) {
    throw new Error(`Listing with id ${promotion.listingId} not found`);
  }
  const existing = await heroPromotionRepository.findMany({ where: { listingId: listing.id } });
  if (existing && existing.length > 0) {
    return existing[0];
  }
  const firstImage = listing.images && listing.images[0];
  const imageUrl = firstImage?.imageUrl || firstImage?.url || '';
  const originalPrice = Number(listing.pricePerDay || listing.price || 0);
  const discountPercent = promotion.discount ? Number(promotion.discount) : 0;
  const discountedPrice = calculateDiscountedPrice(originalPrice, discountPercent);
  const data = {
    title: promotion.customTitle || listing.title,
    description: promotion.customSubtitle || listing.description || '',
    heroImage: imageUrl,
    productService: listing.category?.name || '',
    cardImage: imageUrl,
    location: listing.location || '',
    rating: listing.rating?.toString() || '',
    originalPrice: originalPrice || null,
    discountPercent: discountPercent || null,
    discountedPrice: discountedPrice,
    ctaText: 'View Details',
    ctaLink: `/items/${listing.id}`,
    listingId: listing.id,
    startDate: new Date(),
    isActive: true,
    displayOrder: 0,
    specs: promotion.specs || null,
  };
  return heroPromotionRepository.create(data);
}

module.exports = { createFromPromotion };
