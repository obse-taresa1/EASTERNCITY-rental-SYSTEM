const service = require('../services/listingService');

exports.listPublic = async (req, res, next) => {
  try {
    const data = await service.listPublic(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.create(req.user.id, req.body, req.files || []);
    res.status(201).json({ success: true, message: 'Listing created.', data });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.update(req.user, req.params.id, req.body);
    res.json({ success: true, message: 'Listing updated.', data });
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(req.user, req.params.id);
    res.json({ success: true, message: 'Listing deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.approve = async (req, res, next) => {
  try {
    const data = await service.approve(req.params.id, req.user.id);
    res.json({ success: true, message: 'Listing approved.', data });
  } catch (error) {
    next(error);
  }
};

exports.reject = async (req, res, next) => {
  try {
    const data = await service.reject(req.params.id, req.body.reason, req.user.id);
    res.json({ success: true, message: 'Listing rejected.', data });
  } catch (error) {
    next(error);
  }
};