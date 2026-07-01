const prisma = require('../config/db');

function findPublic(args = {}) {
  return prisma.listing.findMany({
    ...args,
    where: {
      ...(args.where || {}),
      status: { in: ['APPROVED', 'ACTIVE', 'FEATURED'] },
    },
    include: { images: true },
  });
}

function findById(id) {
  return prisma.listing.findUnique({
    where: { id },
    include: { images: true },
  });
}

function create(data) {
  return prisma.listing.create({
    data,
    include: { images: true },
  });
}

function update(id, data) {
  return prisma.listing.update({
    where: { id },
    data,
    include: { images: true },
  });
}

function remove(id) {
  return prisma.listing.delete({
    where: { id },
  });
}

module.exports = {
  findPublic,
  findById,
  create,
  update,
  remove,
};