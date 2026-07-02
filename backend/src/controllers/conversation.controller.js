const repository = require("../repositories/conversation.repository");

async function getMyConversations(req, res, next) {
  try {
    const data = await repository.findManyByUser(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function createConversation(req, res, next) {
  try {
    const data = await repository.create({
      participantOneId: req.user.id,
      participantTwoId: req.body.participantTwoId,
      listingId: req.body.listingId,
      lastMessageAt: new Date(),
    });

    res
      .status(201)
      .json({ success: true, message: "Conversation created.", data });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMyConversations, createConversation };
