const prisma = require("../config/db");

function findManyByUser(userId) {
  return prisma.conversation.findMany({
    where: {
      OR: [{ participantOneId: userId }, { participantTwoId: userId }],
    },
    include: { listing: true, participantOne: true, participantTwo: true },
    orderBy: { createdAt: "desc" },
  });
}

function create(data) {
  return prisma.conversation.create({ data });
}

function findById(id) {
  return prisma.conversation.findUnique({
    where: { id },
    include: { listing: true, participantOne: true, participantTwo: true },
  });
}

module.exports = { findManyByUser, create, findById };
