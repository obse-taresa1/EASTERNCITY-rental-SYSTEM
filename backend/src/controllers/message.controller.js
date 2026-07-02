const repository = require("../repositories/message.repository");

async function sendMessage(req, res, next) {
  try {
    const data = await repository.create({
      conversationId: req.body.conversationId,
      senderId: req.user.id,
      body: req.body.body,
    });

    res.status(201).json({
      success: true,
      message: "Message sent.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getConversationMessages(req, res, next) {
  try {
    await repository.markConversationMessagesRead(
      req.params.conversationId,
      req.user.id,
    );

    const data = await repository.findByConversation(req.params.conversationId);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendMessage,
  getConversationMessages,
};
