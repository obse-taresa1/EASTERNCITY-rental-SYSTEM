const service = require("../services/conversation.service");

async function getMyConversations(req, res, next) {
  try {
    const data = await service.getMyConversations(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function getConversation(req, res, next) {
  try {
    const data = await service.getConversationForUser(
      req.user.id,
      req.params.id,
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function createConversation(req, res, next) {
  try {
    const data = await service.findOrCreateConversation(req.user.id, req.body);

    res
      .status(201)
      .json({ success: true, message: "Conversation ready.", data });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMyConversations, getConversation, createConversation };
