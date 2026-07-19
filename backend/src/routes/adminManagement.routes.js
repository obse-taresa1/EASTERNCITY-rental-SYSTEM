const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const controller = require("../controllers/adminManagement.controller");

const router = express.Router();
router.use(auth, authorize("ADMIN", "SUPER_ADMIN"));

router.get("/analytics", controller.analytics);
router.get("/users", controller.listUsers);
router.post("/admins", authorize("SUPER_ADMIN"), controller.createAdmin);
router.patch("/users/:id", controller.updateUser);
router.delete("/users/:id", controller.deleteUser);
router.get("/listings", controller.listListings);
router.patch("/listings/:id", controller.updateListing);
router.delete("/listings/:id", controller.deleteListing);
router.get("/categories", controller.listCategories);
router.post("/categories", controller.saveCategory);
router.patch("/categories/:id", controller.saveCategory);
router.delete("/categories/:id", controller.deleteCategory);
router.get("/bookings", controller.listBookings);
router.get("/promotions", controller.listPromotions);
router.patch("/promotions/:id", controller.updatePromotion);
router.get("/reviews", controller.listReviews);
router.delete("/reviews/:id", controller.deleteReview);
router.get("/reports", controller.listReports);
router.patch("/reports/:id", controller.updateReport);
router.get("/support-tickets", controller.listSupportTickets);
router.patch("/support-tickets/:id", controller.updateSupportTicket);
router.get("/contact-messages", controller.listContactMessages);
router.patch("/contact-messages/:id", controller.updateContactMessage);
router.get("/notifications", controller.listNotifications);
router.post("/notifications", controller.createNotification);
router.get("/settings", controller.getSettings);
router.put("/settings", controller.saveSettings);
router.get("/logs", authorize("SUPER_ADMIN"), controller.listLogs);

module.exports = router;
