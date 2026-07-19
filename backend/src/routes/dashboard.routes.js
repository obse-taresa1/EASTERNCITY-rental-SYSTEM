const express = require("express");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const controller = require("../controllers/dashboard.controller");

const router = express.Router();

router.use(auth);

router.get(
  "/admin",
  authorize("ADMIN", "SUPER_ADMIN"),
  controller.getAdminDashboard,
);

router.get(
  "/super-admin",
  authorize("SUPER_ADMIN"),
  controller.getSuperAdminDashboard,
);

module.exports = router;
