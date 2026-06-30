const prisma = require('../config/db');

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

function findById(id, select = userSelect) {
  return prisma.user.findUnique({
    where: { id },
    select,
  });
}

function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

function findMany(args = {}) {
  return prisma.user.findMany({
    ...args,
    select: args.select || userSelect,
  });
}

function create(data) {
  return prisma.user.create({ data });
}

function update(id, data, select = userSelect) {
  return prisma.user.update({
    where: { id },
    data,
    select,
  });
}

function remove(id, select = userSelect) {
  return prisma.user.delete({
    where: { id },
    select,
  });
}

module.exports = {
  userSelect,
  findById,
  findByEmail,
  findMany,
  create,
  update,
  remove,
};
