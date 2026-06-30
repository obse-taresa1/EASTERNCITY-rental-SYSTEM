const { ROLES } = require('../utils/constants');

function validateUpdateUser(req, res, next) {
  const allowedFields = ['name', 'email', 'password'];
  const forbiddenFields = Object.keys(req.body).filter((field) => !allowedFields.includes(field));

  if (forbiddenFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot update restricted fields: ${forbiddenFields.join(', ')}.`,
    });
  }

  if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    return res.status(400).json({ success: false, message: 'A valid email is required.' });
  }

  if (req.body.password && req.body.password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  next();
}

function validateCreateAdmin(req, res, next) {
  const { name, email, password, role } = req.body;
  const allowedRoles = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'A valid email is required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Admin creation role must be ADMIN or SUPER_ADMIN.' });
  }

  next();
}

module.exports = {
  validateUpdateUser,
  validateCreateAdmin,
};
