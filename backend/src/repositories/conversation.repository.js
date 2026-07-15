const prisma = require("../config/db");

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

const listingInclude = {
  images: {
    orderBy: { sortOrder: "asc" },
  },
  owner: {
    select: userSelect,
  },
};

const conversationInclude = {
  listing: {
    include: listingInclude,
  },
  participantOne: {
    select: userSelect,
  },
  participantTwo: {
    select: userSelect,
  },
  messages: {
    orderBy: { createdAt: "desc" },
    take: 1,
    include: {
      sender: {
        select: userSelect,
      },
    },
  },
};

function findManyByUser(userId) {
  return prisma.conversation.findMany({
    where: {
      OR: [{ participantOneId: userId }, { participantTwoId: userId }],
    },
    include: conversationInclude,
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
  });
}

function create(data) {
  return prisma.conversation.create({
    data,
    include: conversationInclude,
  });
}

function findById(id) {
  return prisma.conversation.findUnique({
    where: { id },
    include: conversationInclude,
  });
}

function findForListingAndParticipants({ listingId, participantOneId, participantTwoId }) {
  return prisma.conversation.findFirst({
    where: {
      listingId,
      OR: [
        { participantOneId, participantTwoId },
        {
          participantOneId: participantTwoId,
          participantTwoId: participantOneId,
        },
      ],
    },
    include: conversationInclude,
  });
}

function countUnread(conversationId, userId) {
  return prisma.message.count({
    where: { conversationId, senderId: { not: userId }, isRead: false },
  });
}

function updateLastMessageAt(id, lastMessageAt = new Date()) {
  return prisma.conversation.update({
    where: { id },
    data: { lastMessageAt },
    include: conversationInclude,
  });
}

module.exports = {
  findManyByUser,
  create,
  findById,
  findForListingAndParticipants,
  countUnread,
  updateLastMessageAt,
};
