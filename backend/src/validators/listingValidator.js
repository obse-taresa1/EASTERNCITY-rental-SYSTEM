function validateCreateListing(req, res, next) {
  const required = [
    'title',
    'description',
    'categoryId',
    'city',
    'location',
    'pricePerDay',
  ];

  const missing = required.filter((field) => !req.body[field]);

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  if (Number(req.body.pricePerDay) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'pricePerDay must be greater than 0.',
    });
  }

  next();
}

function validateUpdateListing(req, res, next) {
  if (
    req.body.pricePerDay !== undefined &&
    Number(req.body.pricePerDay) <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: 'pricePerDay must be greater than 0.',
    });
  }

  next();
}

module.exports = {
  validateCreateListing,
  validateUpdateListing,
};