const prisma = require("../config/db");

function create(data) {
  return prisma.message.create({
    data,
    include: { sender: true, conversation: true },
  });
}

function findByConversation(conversationId) {
  return prisma.message.findMany({
    where: { conversationId },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });
}

function markConversationMessagesRead(conversationId, userId) {
  return prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });
}

module.exports = {
  create,
  findByConversation,
  markConversationMessagesRead,
};
