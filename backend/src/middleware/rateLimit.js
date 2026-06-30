const buckets = new Map();

function rateLimit({ windowMs = 15 * 60 * 1000, max = 100 } = {}) {
  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const current = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (current.resetAt <= now) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }

    current.count += 1;
    buckets.set(key, current);

    if (current.count > max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
    }

    return next();
  };
}

module.exports = rateLimit;
