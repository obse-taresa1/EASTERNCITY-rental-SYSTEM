const service = require("../services/promotionService");

const list = async (req, res, next) => {
  try {
    const data = await service.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const listPending = async (req, res, next) => {
  try {
    const data = await service.listPending();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const request = async (req, res, next) => {
  try {
    const data = await service.requestPromotion(
      req.user.id,
      req.body,
      req.file,
    );
    res
      .status(201)
      .json({ success: true, message: "Promotion request submitted.", data });
  } catch (error) {
    next(error);
  }
};

const approve = async (req, res, next) => {
  try {
    const data = await service.approve(req.params.id, req.user.id);
    res.json({ success: true, message: "Promotion approved.", data });
  } catch (error) {
    next(error);
  }
};

const reject = async (req, res, next) => {
  try {
    const data = await service.reject(
      req.params.id,
      req.body.reason,
      req.user.id,
    );
    res.json({ success: true, message: "Promotion rejected.", data });
  } catch (error) {
    next(error);
  }
};

const getActiveFeatured = async (req, res, next) => {
  try {
    const all = await service.fetchActivePromotions();
    // Ensure each promotion includes a primary image URL on listing.image
    const promotionsWithImage = all.map(p => {
      const listing = p.listing || {};
      const firstImage = listing.images && listing.images[0];
      const imageUrl = firstImage?.imageUrl || firstImage?.url || "";
      return {
        ...p,
        listing: {
          ...listing,
          image: imageUrl,
        },
      };
    });
    const featured = promotionsWithImage.filter(p => {
      const placement = p.placement || "";
      if (placement.toUpperCase() !== "FEATURED") return false;
      if (p.status !== "APPROVED") return false;
      const listing = p.listing;
      if (!listing) return false;
      if (!["APPROVED", "ACTIVE", "FEATURED"].includes(listing.status)) return false;
      if (!listing.images || listing.images.length === 0) return false;
      if (!listing.ownerId) return false;
      return true;
    });
    res.json({ success: true, data: featured });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  listPending,
  request,
  approve,
  reject,
  getActiveFeatured,
};