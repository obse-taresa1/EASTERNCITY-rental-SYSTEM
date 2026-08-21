const prisma = require('../config/db');

// Get active hero promotions for the public homepage
exports.getActivePromotions = async (req, res, next) => {
  try {
    const now = new Date();
    const promotions = await prisma.heroPromotion.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: now } }] }
        ]
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    // Fetch associated listing images if heroImage is empty
    const missingImageListingIds = promotions.filter(p => p.listingId && !p.heroImage).map(p => p.listingId);
    let fallbackImagesMap = {};
    if (missingImageListingIds.length > 0) {
      const listings = await prisma.listing.findMany({
        where: { id: { in: missingImageListingIds } },
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } }
      });
      fallbackImagesMap = listings.reduce((acc, l) => {
         acc[l.id] = l.images?.[0]?.imageUrl || l.coverImage || "";
         return acc;
      }, {});
    }

    // Process discounts and missing images
    const processed = promotions.map(promo => {
      let finalPrice = promo.originalPrice;
      if (promo.originalPrice && promo.discountPercent && promo.discountPercent > 0) {
        const discountAmount = (parseFloat(promo.originalPrice) * promo.discountPercent) / 100;
        finalPrice = parseFloat(promo.originalPrice) - discountAmount;
      }
      
      let finalHeroImage = promo.heroImage;
      let finalCardImage = promo.cardImage;
      
      if (!finalHeroImage && promo.listingId && fallbackImagesMap[promo.listingId]) {
         finalHeroImage = fallbackImagesMap[promo.listingId];
      }
      if (!finalCardImage && promo.listingId && fallbackImagesMap[promo.listingId]) {
         finalCardImage = fallbackImagesMap[promo.listingId];
      }
      
      return {
        ...promo,
        heroImage: finalHeroImage,
        cardImage: finalCardImage,
        discountedPrice: finalPrice
      };
    });

    res.json(processed);
  } catch (error) {
    next(error);
  }
};

// Admin endpoints
exports.getAllPromotions = async (req, res, next) => {
  try {
    const promotions = await prisma.heroPromotion.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(promotions);
  } catch (error) {
    next(error);
  }
};

exports.createPromotion = async (req, res, next) => {
  try {
    const data = req.body;
    if (data.discountPercent && (data.discountPercent < 0 || data.discountPercent > 100)) {
      return res.status(400).json({ message: "Discount must be between 0 and 100" });
    }
    
    // Convert string dates to Date objects if provided
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const promotion = await prisma.heroPromotion.create({ data });
    res.status(201).json(promotion);
  } catch (error) {
    next(error);
  }
};

exports.updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.discountPercent && (data.discountPercent < 0 || data.discountPercent > 100)) {
      return res.status(400).json({ message: "Discount must be between 0 and 100" });
    }

    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const promotion = await prisma.heroPromotion.update({
      where: { id },
      data
    });
    res.json(promotion);
  } catch (error) {
    next(error);
  }
};

exports.deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.heroPromotion.delete({ where: { id } });
    res.json({ message: "Promotion deleted" });
  } catch (error) {
    next(error);
  }
};
