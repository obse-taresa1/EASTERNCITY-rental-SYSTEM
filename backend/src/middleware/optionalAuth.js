const { verifyToken } = require("../utils/jwt");

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (decoded) {
    req.user = decoded;
  }

  next();
};

module.exports = optionalAuth;
