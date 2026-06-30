// src/validators/authValidator.js

/**
 * Validate Registration Input
 */
const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'A valid email is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  if (role && role !== 'USER') {
    return res.status(400).json({ success: false, message: 'Public registration only creates USER accounts.' });
  }

  next();
};

/**
 * Validate Login Input
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'A valid email is required.' });
  }

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};


