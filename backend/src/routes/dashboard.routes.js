const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.use(authMiddleware);
router.get("/admin", authorize("ADMIN", "SUPER_ADMIN"), dashboardController.getAdminDashboard);
router.get("/super-admin", authorize("SUPER_ADMIN"), dashboardController.getSuperAdminDashboard);

module.exports = router;
