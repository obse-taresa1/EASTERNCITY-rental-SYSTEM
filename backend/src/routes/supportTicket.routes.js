const express = require("express");
const controller = require("../controllers/supportTicket.controller");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const {
  validateCreateTicket,
  validateReplyTicket,
} = require("../validators/supportTicket.validator");

const router = express.Router();

router.use(auth);

router.get("/my", controller.getMyTickets);
router.post("/", validateCreateTicket, controller.createTicket);
router.get("/", authorize("ADMIN", "SUPER_ADMIN"), controller.getAllTickets);
router.post(
  "/:id/replies",
  authorize("ADMIN", "SUPER_ADMIN"),
  validateReplyTicket,
  controller.replyToTicket,
);
router.patch(
  "/:id/resolve",
  authorize("ADMIN", "SUPER_ADMIN"),
  controller.resolveTicket,
);

module.exports = router;
