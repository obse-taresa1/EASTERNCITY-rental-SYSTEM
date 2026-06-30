function log(level, message, meta = {}) {
  const payload = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  console[level](`[${new Date().toISOString()}] ${message}${payload}`);
}

module.exports = {
  info: (message, meta) => log('log', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};
