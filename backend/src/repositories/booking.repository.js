const prisma = require("../config/db");

function create(data) {
  return prisma.booking.create({ data });
}

function findManyByUser(userId) {
  return prisma.booking.findMany({
    where: {
      OR: [{ renterId: userId }, { ownerId: userId }],
    },
    include: { listing: true, renter: true, owner: true },
    orderBy: { createdAt: "desc" },
  });
}

function findAll() {
  return prisma.booking.findMany({
    include: { listing: true, renter: true, owner: true },
    orderBy: { createdAt: "desc" },
  });
}

function findById(id) {
  return prisma.booking.findUnique({
    where: { id },
    include: { listing: true, renter: true, owner: true },
  });
}

function update(id, data) {
  return prisma.booking.update({ where: { id }, data });
}

module.exports = { create, findManyByUser, findAll, findById, update };
