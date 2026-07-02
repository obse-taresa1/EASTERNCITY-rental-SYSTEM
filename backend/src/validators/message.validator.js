function validateSendMessage(req, res, next) {
  if (!req.body.conversationId || !req.body.body) {
    return res.status(400).json({
      success: false,
      message: "conversationId and body are required.",
    });
  }

  next();
}

module.exports = { validateSendMessage };
