const prisma = require('../config/db');

function create(data) {
  return prisma.heroPromotion.create({ data });
}

function findMany(args = {}) {
  return prisma.heroPromotion.findMany(args);
}

module.exports = { create, findMany };
