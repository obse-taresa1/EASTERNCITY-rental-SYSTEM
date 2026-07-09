const prisma = require('../config/db');

function findMany() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
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
  create,
  update,
  remove,
};