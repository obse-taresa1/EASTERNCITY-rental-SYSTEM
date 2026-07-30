const { z } = require("zod");

const messageSchema = z.object({
  id: z.string().optional(),
  sender: z.string().optional(),
  role: z.string().optional(),
  text: z.string().trim().min(1).max(2000),
});

const aiChatSchema = z.object({
  language: z.enum(["en", "am", "so", "af"]).default("en"),
  messages: z.array(messageSchema).min(1).max(12),
});

function validateAiChat(req, res, next) {
  const parsed = aiChatSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid AI chat request.",
      errors: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  req.validatedBody = parsed.data;
  return next();
}

module.exports = {
  validateAiChat,
};
