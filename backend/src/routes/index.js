const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const notificationRoutes = require("./notificationRoutes");
const verificationRoutes = require("./verificationRoutes");
const listingRoutes = require("./listingRoutes");
const categoryRoutes = require("./categoryRoutes");
const promotionRoutes = require("./promotionRoutes");
const reviewRoutes = require("./reviewRoutes");
const dashboardRoutes = require("./dashboard.routes");
const bookingRoutes = require("./booking.routes");
const conversationRoutes = require("./conversation.routes");
const supportTicketRoutes = require("./supportTicket.routes");
const messageRoutes = require("./message.routes");
const contactMessageRoutes = require("./contactMessage.routes");
const aiChatRoutes = require("./aiChat.routes");
const bannerAdRoutes = require("./bannerAdRoutes");
const advertisingRequestRoutes = require("./advertisingRequestRoutes");
const communityRoutes = require("./communityRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/notifications", notificationRoutes);
router.use("/verification", verificationRoutes);
router.use("/listings", listingRoutes);
router.use("/categories", categoryRoutes);
router.use("/promotions", promotionRoutes);
router.use("/reviews", reviewRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/bookings", bookingRoutes);
router.use("/conversations", conversationRoutes);
router.use("/support-tickets", supportTicketRoutes);
router.use("/messages", messageRoutes);
router.use("/contact-messages", contactMessageRoutes);
router.use("/ai-chat", aiChatRoutes);
router.use("/banner-ads", bannerAdRoutes);
router.use("/advertising-requests", advertisingRequestRoutes);
router.use("/community", communityRoutes);
router.use("/admin-management", require("./adminManagement.routes"));
router.use("/advertising/hero-promotions", require("./heroPromotionRoutes"));
router.use("/advertising/featured-listings", require("./featuredListingRoutes"));

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy.",
    data: {
      service: "EasternCity Rental System API",
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

// Public promotion config for authenticated users
const auth = require('../middleware/auth');
const prisma = require('../config/db');

router.get('/public-stats', async (req, res, next) => {
  try {
    const [verifiedUsers, activeListings, cities, rating] = await Promise.all([
      prisma.user.count({ where: { verificationStatus: { in: ['APPROVED', 'VERIFIED'] } } }),
      prisma.listing.count({ where: { status: { in: ['APPROVED', 'PUBLISHED', 'ACTIVE'] } } }), // Assuming APPROVED/PUBLISHED/ACTIVE means active
      prisma.listing.groupBy({ by: ['city'] }).then(c => c.length),
      prisma.review.aggregate({ _avg: { rating: true } })
    ]);
    
    res.json({
      success: true,
      data: {
        verifiedUsers: verifiedUsers,
        activeListings: activeListings,
        cities: cities || 3, // Fallback if no listings
        averageRating: rating._avg.rating ? Number(rating._avg.rating.toFixed(1)) : 5.0
      }
    });
  } catch (e) { 
    next(e); 
  }
});

router.get('/promotion-config', auth, async (req, res, next) => {
  try {
    const PROMO_KEYS = ['featuredListingPricePerDay','homepagePromotionPricePerDay','minPromotionDays','maxPromotionDays','requirePaymentVerification','requireAdminApproval'];
    const rows = await prisma.systemSetting.findMany({ where: { key: { in: PROMO_KEYS } } });
    const config = rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {});
    const defaults = {
      featuredListingPricePerDay: '100',
      homepagePromotionPricePerDay: '400',
      minPromotionDays: '1',
      maxPromotionDays: '30',
      requirePaymentVerification: 'true',
      requireAdminApproval: 'true',
    };
    res.json({ success: true, data: { ...defaults, ...config } });
  } catch (e) { next(e); }
});

module.exports = router;
