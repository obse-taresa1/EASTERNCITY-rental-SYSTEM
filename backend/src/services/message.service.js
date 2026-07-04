const repository = require("../repositories/message.repository");
const conversationRepository = require("../repositories/conversation.repository");
const notificationService = require("./notificationService");

async function sendMessage(userId, payload) {
  const conversation = await conversationRepository.findById(
    payload.conversationId,
  );

  if (!conversation) {
    const error = new Error("Conversation not found.");
    error.statusCode = 404;
    throw error;
  }

  const message = await repository.create({
    conversationId: payload.conversationId,
    senderId: userId,
    body: payload.body,
  });

  const recipientId =
    conversation.participantOneId === userId
      ? conversation.participantTwoId
      : conversation.participantOneId;

  await notificationService.notifyMessageReceived(
    message,
    conversation,
    recipientId,
  );

  return message;
}

async function getConversationMessages(userId, conversationId) {
  await repository.markConversationMessagesRead(conversationId, userId);
  return repository.findByConversation(conversationId);
}

async function getInbox(userId) {
  const conversationRepo = require("../repositories/conversation.repository");

  const conversations = await conversationRepo.findManyByUser(userId);

  const items = await Promise.all(
    conversations.map(async (c) => {
      const lastMessage = await repository
        .findByConversation(c.id)
        .then((msgs) => msgs.slice(-1)[0] || null);
      const unread = await prismaCountUnread(c.id, userId);

      return {
        conversation: c,
        lastMessage,
        unread,
      };
    }),
  );

  return items;
}

function prismaCountUnread(conversationId, userId) {
  const prisma = require("../config/db");
  return prisma.message.count({
    where: { conversationId, senderId: { not: userId }, isRead: false },
  });
}

module.exports = {
  sendMessage,
  getConversationMessages,
  getInbox,
};
