const express = require("express");
const controller = require("../controllers/message.controller");
const auth = require("../middleware/auth");
const { validateSendMessage } = require("../validators/message.validator");

const router = express.Router();

router.use(auth);

router.post("/", validateSendMessage, controller.sendMessage);
router.get("/", controller.getInbox);
router.get("/:conversationId", controller.getConversationMessages);

module.exports = router;
