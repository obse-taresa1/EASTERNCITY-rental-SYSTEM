const { z } = require("zod");
const { parseWithSchema } = require("./validationHelpers");

const createConversationSchema = z.object({
  participantTwoId: z.string().uuid("ownerId must be a valid ID."),
  listingId: z.string().uuid("listingId must be a valid ID."),
});

module.exports = {
  validateCreateConversation: (req, res, next) =>
    parseWithSchema(createConversationSchema, req, res, next),
};
