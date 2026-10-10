const { z } = require("zod");
const { parseWithSchema } = require("./validationHelpers");

const createConversationSchema = z.object({
  participantTwoId: z.string().uuid("ownerId must be a valid ID."),
  listingId: z.string().uuid("listingId must be a valid ID.").optional(),
  communityPostId: z.coerce.number().int().positive("communityPostId must be a valid ID.").optional(),
}).refine(
  (payload) => Boolean(payload.listingId || payload.communityPostId),
  { message: "A listing or community post is required." },
);

module.exports = {
  validateCreateConversation: (req, res, next) =>
    parseWithSchema(createConversationSchema, req, res, next),
};
