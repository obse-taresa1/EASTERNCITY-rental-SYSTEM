const prisma = require("../config/db");

function create(data) {
  return prisma.contactMessage.create({ data });
}

function findAll() {
  return prisma.contactMessage.findMany({
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
}

function update(id, data) {
  return prisma.contactMessage.update({ where: { id }, data });
}

module.exports = { create, findAll, update };
