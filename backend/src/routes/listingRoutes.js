const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const controller = require("../controllers/listingController");
const upload = require("../middleware/uploadMiddleware");
const {
  validateCreateListing,
  validateUpdateListing,
} = require("../validators/listingValidator");

router.get("/", controller.listPublic);
router.get("/my", auth, controller.listMy);
router.get(
  "/manage",
  auth,
  authorize("ADMIN", "SUPER_ADMIN"),
  controller.listManage,
);
router.get("/:id", controller.getById);

router.post(
  "/",
  auth,
  upload.listingImages,
  validateCreateListing,
  controller.create,
);
router.patch("/:id", auth, validateUpdateListing, controller.update);
router.delete("/:id", auth, controller.remove);

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

module.exports = router;
