const dashboardService = require("../services/dashboard.service");

async function getAdminDashboard(req, res, next) {
  try {
    const data = await dashboardService.getAdminDashboard(req.query);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getSuperAdminDashboard(req, res, next) {
  try {
    const data = await dashboardService.getSuperAdminDashboard(req.query);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminDashboard,
  getSuperAdminDashboard,
};
