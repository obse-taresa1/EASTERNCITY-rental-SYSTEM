const { z } = require("zod");
const { parseWithSchema } = require("./validationHelpers");

const notificationBody = z.object({
  title: z.string().trim().min(1, "Notification title is required."),
  body: z.string().trim().min(1, "Notification body is required."),
});

const directNotificationSchema = notificationBody.extend({
  recipient: z.string().trim().min(1, "Recipient user email or ID is required."),
});

module.exports = {
  validateDirectNotification: (req, res, next) =>
    parseWithSchema(directNotificationSchema, req, res, next),
  validateBroadcastNotification: (req, res, next) =>
    parseWithSchema(notificationBody, req, res, next),
};
