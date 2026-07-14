const prisma = require('../config/db');

function findMany() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { listings: true },
      },
    },
  });
}

function findById(id) {
  return prisma.category.findUnique({ where: { id } });
}

function findBySlug(slug) {
  return prisma.category.findUnique({ where: { slug } });
}

function create(data) {
  return prisma.category.create({ data });
}

function update(id, data) {
  return prisma.category.update({ where: { id }, data });
}

function remove(id) {
  return prisma.category.delete({ where: { id } });
}

module.exports = {
  findMany,
  findById,
  findBySlug,
  create,
  update,
  remove,
};
