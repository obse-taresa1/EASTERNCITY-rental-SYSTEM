const { z } = require("zod");
const { parseWithSchema } = require("./validationHelpers");

const createContactMessageSchema = z.object({
  userId: z.string().trim().optional(),
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("A valid email is required."),
  subject: z.string().trim().min(1, "Subject is required."),
  message: z.string().trim().min(1, "Message is required."),
});

const replyContactMessageSchema = z.object({
  adminReply: z.string().trim().min(1, "Reply message is required."),
});

module.exports = {
  validateCreateContactMessage: (req, res, next) =>
    parseWithSchema(createContactMessageSchema, req, res, next),
  validateReplyContactMessage: (req, res, next) =>
    parseWithSchema(replyContactMessageSchema, req, res, next),
};
