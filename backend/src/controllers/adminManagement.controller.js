const service = require("../services/adminManagement.service");

function handler(fn) {
  return async (req, res, next) => {
    try {
      const data = await fn(req);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  analytics: handler((req) => service.analytics(req.query)),
  createAdmin: handler((req) => service.createAdmin(req.user, req.body)),
  createNotification: handler((req) => service.createNotification(req.user, req.body)),
  deleteCategory: handler((req) => service.deleteCategory(req.user, req.params.id)),
  deleteListing: handler((req) => service.deleteListing(req.user, req.params.id)),
  deleteReview: handler((req) => service.deleteReview(req.user, req.params.id)),
  deleteUser: handler((req) => service.deleteUser(req.user, req.params.id)),
  getSettings: handler(() => service.getSettings()),
  listBookings: handler((req) => service.listBookings(req.query)),
  listCategories: handler(() => service.listCategories()),
  listContactMessages: handler(() => service.listContactMessages()),
  listListings: handler((req) => service.listListings(req.query)),
  listLogs: handler((req) => service.listLogs(req.query)),
  listNotifications: handler(() => service.listNotifications()),
  listPromotions: handler((req) => service.listPromotions(req.query)),
  listReports: handler((req) => service.listReports(req.query)),
  listReviews: handler((req) => service.listReviews(req.query)),
  listSupportTickets: handler((req) => service.listSupportTickets(req.query)),
  listUsers: handler((req) => service.listUsers(req.query)),
  saveCategory: handler((req) => service.saveCategory(req.user, req.body, req.params.id)),
  saveSettings: handler((req) => service.saveSettings(req.user, req.body)),
  updateContactMessage: handler((req) => service.updateContactMessage(req.user, req.params.id, req.body)),
  updateListing: handler((req) => service.updateListing(req.user, req.params.id, req.body)),
  updatePromotion: handler((req) => service.updatePromotion(req.user, req.params.id, req.body.status, req.body.reason)),
  updateReport: handler((req) => service.updateReport(req.user, req.params.id, req.body.status)),
  updateSupportTicket: handler((req) => service.updateSupportTicket(req.user, req.params.id, req.body)),
  updateUser: handler((req) => service.updateUser(req.user, req.params.id, req.body)),
};
