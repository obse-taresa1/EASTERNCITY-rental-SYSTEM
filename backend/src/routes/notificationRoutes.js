const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const notificationController = require("../controllers/notificationController");
const {
  validateDirectNotification,
  validateBroadcastNotification,
} = require("../validators/notificationValidator");

router.use(authMiddleware);

router.get("/", notificationController.list);
router.post(
  "/",
  authorize("ADMIN", "SUPER_ADMIN"),
  validateDirectNotification,
  notificationController.sendDirect,
);
router.post(
  "/broadcast",
  authorize("ADMIN", "SUPER_ADMIN"),
  validateBroadcastNotification,
  notificationController.broadcast,
);
router.patch("/read-all", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markRead);

module.exports = router;
