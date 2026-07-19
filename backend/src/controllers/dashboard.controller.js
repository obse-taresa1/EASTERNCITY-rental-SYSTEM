const dashboardService = require("../services/dashboard.service");

const getAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard(req.query);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getSuperAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getSuperAdminDashboard(req.query);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getSuperAdminDashboard,
};
