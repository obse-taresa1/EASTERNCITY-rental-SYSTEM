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

async function sendContactReplyEmail({ to, recipientName, subject, reply, adminName }) {
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    logger.warn("SMTP is not configured. Contact reply email was not sent.", { to });
    return {
      sent: false,
      reason: "SMTP is not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS, and MAIL_FROM to backend/.env, then restart the backend.",
    };
  }

  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch (error) {
    logger.error("Nodemailer is not installed. Contact reply email was not sent.", { to });
    return { sent: false, reason: "Email service is not installed" };
  }

  try {
    const transporter = nodemailer.createTransport(smtpConfig);
    const safeName = escapeHtml(recipientName || "there");
    const safeSubject = escapeHtml(subject || "Your Eastern Cities enquiry");
    const safeReply = escapeHtml(reply).replace(/\n/g, "<br />");
    const safeAdminName = escapeHtml(adminName || "Eastern Cities Support");

    await transporter.sendMail({
      from: getMailFrom(),
      to,
      subject: `Reply from Eastern Cities: ${subject || "Your enquiry"}`,
      text: [
        `Hello ${recipientName || "there"},`,
        "",
        `Regarding: ${subject || "Your enquiry"}`,
        "",
        reply,
        "",
        `- ${adminName || "Eastern Cities Support"}`,
      ].join("\n"),
      html: `
        <!doctype html>
        <html lang="en">
          <body style="margin:0; padding:0; background:#f6f3f4; color:#241820; font-family:Arial, Helvetica, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3f4; padding:32px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; overflow:hidden; background:#ffffff; border:1px solid #eadde1; border-radius:18px; box-shadow:0 12px 32px rgba(70, 22, 34, 0.12);">
                    <tr>
                      <td style="padding:28px 32px; background:linear-gradient(135deg, #8e1d35 0%, #4a202a 58%, #21191d 100%); color:#ffffff;">
                        <div style="font-size:13px; font-weight:700; letter-spacing:1.8px; text-transform:uppercase; color:#fbd9df;">Eastern Cities</div>
                        <div style="padding-top:10px; font-size:26px; line-height:1.25; font-weight:700;">✦ A reply to your enquiry</div>
                        <div style="padding-top:8px; font-size:14px; line-height:1.5; color:#f4dce2;">Premium rentals, thoughtfully connected.</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px;">
                        <p style="margin:0 0 10px; font-size:17px; line-height:1.55; color:#241820;">Hello ${safeName},</p>
                        <p style="margin:0 0 24px; font-size:15px; line-height:1.65; color:#62535a;">Our team has responded to your message.</p>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px; background:#fbf5f6; border:1px solid #efd9df; border-left:4px solid #b11226; border-radius:12px;">
                          <tr><td style="padding:16px 18px;"><div style="font-size:11px; font-weight:700; letter-spacing:1.1px; text-transform:uppercase; color:#8e1d35;">Regarding your enquiry</div><div style="padding-top:7px; font-size:16px; line-height:1.45; font-weight:700; color:#2c2025;">${safeSubject}</div></td></tr>
                        </table>
                        <div style="padding:22px; background:#ffffff; border:1px solid #eadde1; border-radius:12px; font-size:16px; line-height:1.75; color:#30242a;">${safeReply}</div>
                        <p style="margin:24px 0 0; font-size:15px; line-height:1.65; color:#62535a;">Kind regards,<br /><strong style="color:#2c2025;">${safeAdminName}</strong></p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 32px; border-top:1px solid #eadde1; background:#fcfafb; text-align:center;"><div style="font-size:12px; line-height:1.6; color:#89777e;">This message was sent by Eastern Cities Support.</div><div style="padding-top:4px; font-size:12px; color:#b11226; font-weight:700;">EASTERN CITIES</div></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    logger.info("Contact reply email sent", { to });
    return { sent: true };
  } catch (error) {
    logger.error("Contact reply email delivery failed", { to, error: error.message });
    return { sent: false, reason: "SMTP delivery failed" };
  }
}

function getPublicAppUrl() {
  return (process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
}

function advertisingEmailTemplate({ title, eyebrow = "ADVERTISING CAMPAIGN", greeting, intro, request, statusLabel, note, ctaLabel, ctaUrl, success = false }) {
  const rows = [
    ["Reference", request.reference],
    ["Company", request.companyName],
    ["Campaign", String(request.campaignType || "HOMEPAGE_BANNER").replaceAll("_", " ")],
    ["Payment status", statusLabel],
  ];
  const detailRows = rows.map(([label, value]) => `
    <tr>
      <td style="padding:11px 12px;border-bottom:1px solid #e5e7eb;color:#64748b;font-size:11px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;width:42%;">${escapeHtml(label)}</td>
      <td style="padding:11px 12px;border-bottom:1px solid #e5e7eb;color:#172033;font-size:13px;font-weight:600;">${escapeHtml(value || "-")}</td>
    </tr>`).join("");
  const safeNote = note ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#fff8ed;border:1px solid #fed7aa;border-left:4px solid #d97706;border-radius:10px;"><tr><td style="padding:15px 16px;color:#4b2a06;font-size:14px;line-height:1.6;"><strong style="display:block;margin-bottom:5px;">Message from the advertising team</strong>${escapeHtml(note).replace(/\n/g, "<br />")}</td></tr></table>` : "";
  const safeCta = ctaUrl ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;"><tr><td bgcolor="${success ? "#15803d" : "#b11226"}" style="border-radius:8px;"><a href="${escapeHtml(ctaUrl)}" target="_blank" style="display:inline-block;padding:13px 18px;color:#fff;text-decoration:none;font-size:14px;font-weight:700;">${escapeHtml(ctaLabel || "View campaign")}</a></td></tr></table>` : "";
  return `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#172033;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 14px;background:#f8fafc;"><tr><td align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;"><tr><td style="padding:27px 28px;background:linear-gradient(135deg,#dc2626,#991b1b);color:#fff;"><div style="font-size:18px;font-weight:800;">&#10148; EASTERN Cities</div><div style="margin-top:14px;font-size:10px;font-weight:700;letter-spacing:1.2px;">${escapeHtml(eyebrow)}</div><div style="margin-top:7px;font-size:24px;line-height:1.25;font-weight:800;">${escapeHtml(title)}</div><div style="margin-top:6px;font-size:12px;color:#fee2e2;">Rental Marketplace</div></td></tr><tr><td style="padding:28px;"><p style="margin:0 0 12px;font-size:15px;line-height:1.55;">Hello ${escapeHtml(greeting || request.contactPerson || "there")},</p><p style="margin:0 0 20px;font-size:14px;line-height:1.65;color:#475569;">${escapeHtml(intro)}</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">${detailRows}</table>${safeNote}${safeCta}</td></tr><tr><td style="padding:20px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;color:#64748b;font-size:11px;line-height:1.65;"><strong style="color:#334155;">Eastern Cities Marketplace</strong><br />Connecting renters and owners across Eastern Ethiopia.<br />Jigjiga &bull; Dire Dawa &bull; Harar<br /><span style="color:#b11226;">support@easterncities.com</span><br />&copy; 2026 Eastern Cities Marketplace</td></tr></table></td></tr></table></body></html>`;
}

async function sendAdvertisingStatusEmail(request) {
  const smtpConfig = getSmtpConfig();
  if (!smtpConfig) {
    logger.warn("SMTP is not configured. Advertising status email was not sent.", { to: request.email, reference: request.reference });
    return { sent: false, reason: "SMTP is not configured" };
  }
  const baseUrl = getPublicAppUrl();
  const status = String(request.status || "PENDING").toUpperCase();
  let title = "Your advertising campaign has been updated";
  let intro = "The Eastern Cities advertising team has updated your campaign request.";
  let statusLabel = status.replaceAll("_", " ");
  let ctaLabel = "View campaign";
  let ctaUrl = `${baseUrl}/advertise-with-us`;
  let success = false;
  if (status === "WAITING_PAYMENT") {
    title = "Your campaign is awaiting payment";
    intro = "Our advertising team has reviewed your request. Please read their message below, then upload your Telebirr or CBE Birr payment receipt.";
    statusLabel = "Awaiting payment receipt";
    ctaLabel = "Upload payment receipt";
    ctaUrl = `${baseUrl}/advertise-with-us?payment=${encodeURIComponent(request.reference)}`;
  } else if (status === "APPROVED") {
    title = "Congratulations - your campaign is approved";
    intro = "Your payment and advertising campaign have been approved. Your banner will appear automatically during its scheduled dates.";
    statusLabel = "Approved";
    success = true;
  } else if (status === "REJECTED") {
    title = "Your campaign needs attention";
    intro = "The advertising team could not approve this campaign or payment receipt yet. Please review their note and contact support if you need help.";
    statusLabel = "Needs attention";
    ctaLabel = "Contact support";
    ctaUrl = `${baseUrl}/contact`;
  }
  const transporter = require("nodemailer").createTransport(smtpConfig);
  await transporter.sendMail({
    from: getMailFrom(),
    to: request.email,
    subject: status === "WAITING_PAYMENT" ? "Payment requested for your Eastern Cities campaign" : status === "APPROVED" ? "Your Eastern Cities advertising campaign has been approved" : `Your Eastern Cities advertising campaign: ${statusLabel}`,
    text: `${title}\n\nReference: ${request.reference}\nCompany: ${request.companyName}\nStatus: ${statusLabel}\n\n${request.adminNote || ""}\n\n${ctaUrl}`,
    html: advertisingEmailTemplate({ title, greeting: request.contactPerson, intro, request, statusLabel, note: request.adminNote, ctaLabel, ctaUrl, success }),
  });
  logger.info("Advertising status email sent", { to: request.email, reference: request.reference, status });
  return { sent: true };
}

async function sendAdvertisingRequestEmails(request) {
  return { customer: false, admin: false, request };
}

module.exports = {
  sendPasswordResetEmail,
  sendContactReplyEmail,
  sendAdvertisingRequestEmails,
  sendAdvertisingStatusEmail,
};
