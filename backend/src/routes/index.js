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
const adminManagementRoutes = require("./adminManagement.routes");
const bookingRoutes = require("./booking.routes");
const conversationRoutes = require("./conversation.routes");
const supportTicketRoutes = require("./supportTicket.routes");
const messageRoutes = require("./message.routes");

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
router.use("/admin-management", adminManagementRoutes);
router.use("/bookings", bookingRoutes);
router.use("/conversations", conversationRoutes);
router.use("/support-tickets", supportTicketRoutes);
router.use("/messages", messageRoutes);
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

module.exports = router;

