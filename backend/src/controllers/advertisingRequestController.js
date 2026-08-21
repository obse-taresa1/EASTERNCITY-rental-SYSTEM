const service = require("../services/advertisingRequestService");

exports.create = async (req, res, next) => {
  try {
    const data = await service.create(req.body, req.file);
    res.status(201).json({ success: true, message: "Advertising request submitted. Our team will contact you within 24 hours.", data });
  } catch (error) { next(error); }
};

exports.list = async (req, res, next) => {
  try {
    await service.expireCampaigns();
    res.json({ success: true, data: await service.list(req.query.status) });
  } catch (error) { next(error); }
};

exports.update = async (req, res, next) => {
  try {
    res.json({ success: true, data: await service.update(req.params.id, req.body, req.user) });
  } catch (error) { next(error); }
};

exports.uploadReceipt = async (req, res, next) => {
  try {
    const data = await service.uploadReceipt(req.params.reference, req.body.email, req.file);
    res.json({ success: true, message: "Payment receipt uploaded. The advertising team will verify it shortly.", data });
  } catch (error) { next(error); }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const data = await service.getPaymentStatus(req.params.reference, req.body.email);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};
