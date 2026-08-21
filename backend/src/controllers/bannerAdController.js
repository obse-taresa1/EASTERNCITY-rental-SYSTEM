const service = require("../services/bannerAdService");

function send(handler, status = 200) {
  return async (req, res, next) => {
    try {
      const data = await handler(req);
      res.status(status).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  listActive: send(() => service.getActiveBannerAds()),
  listAll: send(() => service.getAllBannerAds()),
  create: send((req) => service.createBannerAd(req.user, req.body, req.file), 201),
  update: send((req) => service.updateBannerAd(req.user, req.params.id, req.body, req.file)),
  remove: send((req) => service.deleteBannerAd(req.user, req.params.id)),
  view: send((req) => service.recordBannerEvent(req.params.id, "view")),
  click: send((req) => service.recordBannerEvent(req.params.id, "click")),
};
