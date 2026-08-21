const prisma = require('../config/db');

exports.getActiveFeatured = async (req, res, next) => {
  try {
    const now = new Date();
    const activePromotions = await prisma.promotion.findMany({
      where: {
        status: 'APPROVED',
        placement: { in: ['Featured Listing', 'FEATURED', 'FEATURED_LISTING'] },
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: { startDate: 'desc' }, // newest approved first
      include: {
        listing: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            owner: { select: { id: true, name: true, email: true } },
            category: true
          }
        }
      }
    });

    // Deduplicate: if a listing has multiple active promotions, keep only the newest (first due to DESC order)
    const seenListingIds = new Set();
    const deduplicated = activePromotions.filter(p => {
      if (!p.listingId || seenListingIds.has(p.listingId)) return false;
      seenListingIds.add(p.listingId);
      return true;
    });

    const processed = deduplicated.map(p => {
      const originalPrice = parseFloat(p.listing?.pricePerDay ?? 0);
      const priceType = p.listing?.priceType || 'Day';

      let discountedPrice = null;
      if (p.discount && p.discount > 0 && originalPrice > 0) {
        const discountAmount = (originalPrice * p.discount) / 100;
        discountedPrice = Math.round((originalPrice - discountAmount) * 100) / 100;
      }

      return {
        id: p.id,
        listingId: p.listingId,
        discountPercent: p.discount || 0,
        startDate: p.startDate,
        endDate: p.endDate,
        isActive: true,
        listing: {
          ...p.listing,
          image: p.listing?.images?.[0]?.imageUrl || p.listing?.coverImage || null
        },
        originalPrice,
        discountedPrice,
        priceType,
      };
    });

    res.json(processed);
  } catch (error) {
    next(error);
  }
};

exports.getAllFeatured = async (req, res, next) => {
  try {
    const featured = await prisma.featuredListing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: { title: true, id: true, pricePerDay: true, priceType: true }
        }
      }
    });
    res.json(featured);
  } catch (error) {
    next(error);
  }
};

exports.createFeatured = async (req, res, next) => {
  try {
    const data = req.body;
    if (data.discountPercent && (data.discountPercent < 0 || data.discountPercent > 100)) {
      return res.status(400).json({ message: "Discount must be between 0 and 100" });
    }

    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const featured = await prisma.featuredListing.create({ data });
    res.status(201).json(featured);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "This listing is already featured." });
    }
    next(error);
  }
};

exports.updateFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (data.discountPercent && (data.discountPercent < 0 || data.discountPercent > 100)) {
      return res.status(400).json({ message: "Discount must be between 0 and 100" });
    }

    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const featured = await prisma.featuredListing.update({
      where: { id },
      data
    });
    res.json(featured);
  } catch (error) {
    next(error);
  }
};

exports.deleteFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.featuredListing.delete({ where: { id } });
    res.json({ message: "Featured listing deleted" });
  } catch (error) {
    next(error);
  }
};
