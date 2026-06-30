function auditLogger(req, res, next) {
  const userId = req.user?.id || 'anonymous';
  const startedAt = Date.now();

  res.on('finish', () => {
    console.log(
      `[AUDIT] user=${userId} method=${req.method} path=${req.originalUrl} status=${res.statusCode} durationMs=${Date.now() - startedAt}`,
    );
  });

  next();
}

module.exports = auditLogger;
