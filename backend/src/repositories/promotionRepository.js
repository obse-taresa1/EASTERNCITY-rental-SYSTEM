const prisma = require('../config/db');

function findMany(args = {}) {
  return prisma.promotion.findMany({
    ...args,
    orderBy: { createdAt: 'desc' },
  });
}

function create(data) {
  return prisma.promotion.create({ data });
}

function update(id, data) {
  return prisma.promotion.update({ where: { id }, data });
}

module.exports = {
  findMany,
  create,
  update,
};