const express = require("express");
const controller = require("../controllers/conversation.controller");
const auth = require("../middleware/auth");
const {
  validateCreateConversation,
} = require("../validators/conversation.validator");

const router = express.Router();

router.use(auth);

router.get("/", controller.getMyConversations);
router.get("/:id", controller.getConversation);
router.post("/", validateCreateConversation, controller.createConversation);

module.exports = router;
