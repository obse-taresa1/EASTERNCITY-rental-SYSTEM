const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/uploadMiddleware");
const controller = require("../controllers/bannerAdController");

const router = express.Router();

router.get("/", controller.listActive);
router.get("/manage", auth, authorize("ADMIN", "SUPER_ADMIN"), controller.listAll);
router.post("/:id/view", controller.view);
router.post("/:id/click", controller.click);
router.post("/", auth, authorize("ADMIN", "SUPER_ADMIN"), upload.bannerImage, controller.create);
router.patch("/:id", auth, authorize("ADMIN", "SUPER_ADMIN"), upload.bannerImage, controller.update);
router.delete("/:id", auth, authorize("ADMIN", "SUPER_ADMIN"), controller.remove);

module.exports = router;
