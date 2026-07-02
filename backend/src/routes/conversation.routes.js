const express = require("express");
const controller = require("../controllers/conversation.controller");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/", controller.getMyConversations);
router.post("/", controller.createConversation);

module.exports = router;
