const prisma = require("../config/db");

const senderSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

function create(data) {
  return prisma.message.create({
    data,
    include: {
      sender: {
        select: senderSelect,
      },
      conversation: true,
    },
  });
}

function findByConversation(conversationId) {
  return prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: senderSelect,
      },
    },
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
