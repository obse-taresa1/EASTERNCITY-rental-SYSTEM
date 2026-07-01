const service = require('../services/reviewService');

exports.listByListing = async (req, res, next) => {
  try {
    const data = await service.listByListing(req.params.listingId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.create(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Review submitted.', data });
  } catch (error) {
    next(error);
  }
};