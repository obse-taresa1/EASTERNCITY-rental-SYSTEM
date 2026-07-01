function validateReview(req, res, next) {
  const required = ['listingId', 'bookingId', 'rating'];
  const missing = required.filter((field) => !req.body[field]);

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  const rating = Number(req.body.rating);

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5.',
    });
  }

  next();
}

module.exports = {
  validateReview,
};