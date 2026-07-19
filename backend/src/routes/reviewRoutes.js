const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const controller = require("../controllers/reviewController");
const { validateReview } = require("../validators/reviewValidator");

router.get("/my", auth, controller.listMine);
router.get("/", auth, authorize("ADMIN", "SUPER_ADMIN"), controller.listAll);
router.get("/:listingId", controller.listByListing);
router.post("/", auth, validateReview, controller.create);

module.exports = router;

