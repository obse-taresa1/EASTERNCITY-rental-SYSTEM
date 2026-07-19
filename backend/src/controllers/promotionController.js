const service = require("../services/promotionService");

exports.list = async (req, res, next) => {
  try {
    const data = await service.list(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.listPending = async (req, res, next) => {
  try {
    const data = await service.listPending();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.request = async (req, res, next) => {
  try {
    const data = await service.requestPromotion(
      req.user.id,
      req.body,
      req.file,
    );
    res
      .status(201)
      .json({ success: true, message: "Promotion request submitted.", data });
  } catch (error) {
    next(error);
  }
};

exports.approve = async (req, res, next) => {
  try {
    const data = await service.approve(req.params.id, req.user.id);
    res.json({ success: true, message: "Promotion approved.", data });
  } catch (error) {
    next(error);
  }
};

exports.reject = async (req, res, next) => {
  try {
    const data = await service.reject(
      req.params.id,
      req.body.reason,
      req.user.id,
    );
    res.json({ success: true, message: "Promotion rejected.", data });
  } catch (error) {
    next(error);
  }
};
