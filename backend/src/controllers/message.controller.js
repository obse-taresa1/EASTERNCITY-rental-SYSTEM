const service = require("../services/message.service");

async function sendMessage(req, res, next) {
  try {
    const data = await service.sendMessage(req.user.id, req.body);

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
    const data = await service.getConversationMessages(
      req.user.id,
      req.params.conversationId
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getInbox(req, res, next) {
  try {
    const data = await service.getInbox(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  sendMessage,
  getConversationMessages,
  getInbox,
};

