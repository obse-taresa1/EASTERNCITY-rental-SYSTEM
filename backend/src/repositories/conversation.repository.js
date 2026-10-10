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

function findForContextAndParticipants({ listingId, communityPostId, participantOneId, participantTwoId }) {
  return prisma.conversation.findFirst({
    where: {
      ...(listingId ? { listingId } : { communityPostId }),
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

function findCommunityPostById(id) {
  return prisma.communityPost.findUnique({
    where: { id },
    select: { authorId: true },
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
  findForContextAndParticipants,
  findCommunityPostById,
  countUnread,
  updateLastMessageAt,
};
