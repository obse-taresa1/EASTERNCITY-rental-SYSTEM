const express = require("express");
const rateLimit = require("express-rate-limit");
const optionalAuth = require("../middleware/optionalAuth");
const aiChatController = require("../controllers/aiChat.controller");
const { validateAiChat } = require("../validators/aiChat.validator");

const router = express.Router();

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  keyGenerator: (req) => req.user?.id || req.ip,
  max: (req) => {
    const role = String(req.user?.role || "GUEST").toUpperCase();
    if (role === "SUPER_ADMIN" || role === "ADMIN") return 120;
    if (role === "USER") return 60;
    return 20;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Rate limit exceeded for your role. Try again later.",
  },
});

router.post("/", optionalAuth, aiRateLimit, validateAiChat, aiChatController.streamChat);

module.exports = router;
