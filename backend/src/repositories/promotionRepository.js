const prisma = require('../config/db');

function findMany(args = {}) {
  const { where, ...rest } = args;
  return prisma.promotion.findMany({
    where,
    ...rest,
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          images: {
            take: 1,
            select: { imageUrl: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

function findById(id) {
  return prisma.promotion.findUnique({ where: { id } });
}

function create(data) {
  return prisma.promotion.create({ data });
}

function update(id, data) {
  return prisma.promotion.update({ where: { id }, data });
}

module.exports = {
  findMany,
  findById,
  create,
  update,
  delete: (id) => prisma.promotion.delete({ where: { id } }),
};