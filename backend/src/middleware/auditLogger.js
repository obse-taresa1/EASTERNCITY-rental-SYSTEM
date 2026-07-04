const path = require("path");
const fs = require("fs");
const winston = require("winston");

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const auditLoggerTransport = new winston.transports.File({
  filename: path.join(logsDir, "audit.log"),
  level: "info",
  maxsize: 10 * 1024 * 1024,
  maxFiles: 5,
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [auditLoggerTransport],
});

function auditLogger(req, res, next) {
  const userId = req.user?.id || "anonymous";
  const startedAt = Date.now();

  res.on("finish", () => {
    logger.info("audit", {
      user: userId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  });

  next();
}

module.exports = auditLogger;
