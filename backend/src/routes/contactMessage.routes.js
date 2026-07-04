const express = require("express");
const controller = require("../controllers/contactMessage.controller");
const auth = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");
const authorize = require("../middleware/authorize");
const {
  validateCreateContactMessage,
  validateReplyContactMessage,
} = require("../validators/contactMessage.validator");

const router = express.Router();

router.post("/", optionalAuth, validateCreateContactMessage, controller.createMessage);
router.get("/", auth, authorize("ADMIN", "SUPER_ADMIN"), controller.listMessages);
router.patch(
  "/:id/reply",
  auth,
  authorize("ADMIN", "SUPER_ADMIN"),
  validateReplyContactMessage,
  controller.replyToMessage,
);
router.patch(
  "/:id/resolve",
  auth,
  authorize("ADMIN", "SUPER_ADMIN"),
  controller.resolveMessage,
);

module.exports = router;
