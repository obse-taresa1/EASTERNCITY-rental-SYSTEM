const prisma = require("../config/db");

function create(data) {
  return prisma.supportTicket.create({ data });
}

function findManyByUser(userId) {
  return prisma.supportTicket.findMany({
    where: { userId },
    include: { replies: true },
    orderBy: { createdAt: "desc" },
  });
}

function findAll() {
  return prisma.supportTicket.findMany({
    include: { user: true, replies: true },
    orderBy: { createdAt: "desc" },
  });
}

function update(id, data) {
  return prisma.supportTicket.update({ where: { id }, data });
}

function createReply(data) {
  return prisma.supportTicketReply.create({ data });
}

function findById(id) {
  return prisma.supportTicket.findUnique({
    where: { id },
    include: { user: true, replies: true },
  });
}

module.exports = { create, findManyByUser, findAll, update, createReply, findById };
