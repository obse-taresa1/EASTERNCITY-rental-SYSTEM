const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/uploadMiddleware");
const controller = require("../controllers/promotionController");
const {
  validatePromotionRequest,
} = require("../validators/promotionValidator");

// User's own promotions (must come before the admin-only GET /)
router.get("/mine", auth, controller.listMine);

router.get("/", auth, authorize("ADMIN", "SUPER_ADMIN"), controller.list);
router.get(
  "/pending",
  auth,
  authorize("ADMIN", "SUPER_ADMIN"),
  controller.listPending,
);
router.post(
  "/",
  auth,
  upload.paymentProof,
  validatePromotionRequest,
  controller.request,
);

router.patch(
  "/:id/approve",
  auth,
  authorize("ADMIN", "SUPER_ADMIN"),
  controller.approve,
);
router.patch(
  "/:id/reject",
  auth,
  authorize("ADMIN", "SUPER_ADMIN"),
  controller.reject,
);

router.get("/featured/active", controller.getActiveFeatured);

// Delete a promotion (Admin / Super Admin only)
router.delete('/:id', auth, authorize('ADMIN', 'SUPER_ADMIN'), controller.deletePromotion);

module.exports = router;
