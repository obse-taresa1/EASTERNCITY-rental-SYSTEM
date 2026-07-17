const logger = require("../config/logger");

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure:
      String(process.env.SMTP_SECURE || "").toLowerCase() === "true" ||
      port === 465,
    auth: {
      user,
      pass,
    },
  };
}

function getMailFrom() {
  return process.env.MAIL_FROM || process.env.SMTP_USER || "EasternCity <no-reply@easterncity.local>";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    logger.warn("SMTP is not configured. Password reset email was not sent.", {
      to,
    });
    console.log(`Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch (error) {
    logger.error("Nodemailer is not installed. Password reset email was not sent.", {
      to,
    });
    throw new Error("Email service is not installed. Run npm install in the backend folder.");
  }

  const transporter = nodemailer.createTransport(smtpConfig);
  const safeResetUrl = escapeHtml(resetUrl);

  await transporter.sendMail({
    from: getMailFrom(),
    to,
    subject: "Reset your EasternCity password",
    text: [
      "We received a request to reset your EasternCity password.",
      "",
      "Open this reset link:",
      resetUrl,
      "",
      "This link expires in 30 minutes. If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <p>We received a request to reset your EasternCity password.</p>
      <p><a href="${safeResetUrl}">Reset your password</a></p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${safeResetUrl}">${safeResetUrl}</a></p>
      <p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>
    `,
  });

  logger.info("Password reset email sent", { to });
}

module.exports = {
  sendPasswordResetEmail,
};
