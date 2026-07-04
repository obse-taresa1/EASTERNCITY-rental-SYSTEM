const { z } = require("zod");
const { parseWithSchema } = require("./validationHelpers");

const createTicketSchema = z.object({
  subject: z.string().trim().min(1, "Subject and message are required."),
  message: z.string().trim().min(1, "Subject and message are required."),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
});

const replyTicketSchema = z.object({
  message: z.string().trim().min(1, "Reply message is required."),
});

module.exports = {
  validateCreateTicket: (req, res, next) => parseWithSchema(createTicketSchema, req, res, next),
  validateReplyTicket: (req, res, next) => parseWithSchema(replyTicketSchema, req, res, next),
};
