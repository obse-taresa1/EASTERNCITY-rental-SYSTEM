const logger = require("../config/logger");

async function sendPasswordResetEmail({ to, resetUrl }) {
  logger.info("Password reset email generated", {
    to,
    resetUrl,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`Password reset link for ${to}: ${resetUrl}`);
  }
}

module.exports = {
  sendPasswordResetEmail,
};
