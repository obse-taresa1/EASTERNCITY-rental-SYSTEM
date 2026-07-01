function validateCategory(req, res, next) {
  if (!req.body.name || !req.body.slug) {
    return res.status(400).json({
      success: false,
      message: 'Category name and slug are required.',
    });
  }

  next();
}

module.exports = {
  validateCategory,
};