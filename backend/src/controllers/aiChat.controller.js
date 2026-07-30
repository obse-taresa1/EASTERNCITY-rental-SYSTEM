const aiChatService = require("../services/aiChat.service");

async function streamChat(req, res, next) {
  try {
    await aiChatService.streamAiChat({ req, res });
  } catch (error) {
    console.error("[AI Chat Backend Error]:", error);
    // Always expose the actual error message during development; otherwise send a generic fallback.
    const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined;
    const errorMsg = isDev ? `Backend Error: ${error.message || error}` : "The AI assistant is temporarily unavailable.";

    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: errorMsg });
    }
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: errorMsg,
      })}\n\n`,
    );
    return res.end();
  }
}

module.exports = {
  streamChat,
};
