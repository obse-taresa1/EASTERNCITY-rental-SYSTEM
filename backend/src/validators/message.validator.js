const { z } = require('zod');
const { parseWithSchema } = require('./validationHelpers');

const sendMessageSchema = z.object({
  conversationId: z.string().uuid('conversationId must be a valid ID.'),
  body: z.string().trim().min(1, 'Message body is required.'),
});

module.exports = {
  validateSendMessage: (req, res, next) => parseWithSchema(sendMessageSchema, req, res, next),
};