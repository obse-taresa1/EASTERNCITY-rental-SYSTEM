const ALLOWED_PLACEMENTS = ['FEATURED', 'TOP_LISTING', 'HOME_BANNER'];

function validatePromotionRequest(req, res, next) {
  const required = ['listingId', 'packageType', 'placement', 'amount'];
  const missing = required.filter((field) => !req.body[field]);

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  if (!ALLOWED_PLACEMENTS.includes(req.body.placement)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid promotion placement.',
    });
  }

  if (Number(req.body.amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be greater than 0.',
    });
  }

  next();
}

module.exports = {
  validatePromotionRequest,
};