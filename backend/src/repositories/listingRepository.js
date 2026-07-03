const prisma = require("../config/db");

const listingInclude = {
  images: {
    orderBy: { sortOrder: "asc" },
  },
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  },
  approvedBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
};

function findPublic(args = {}) {
  return prisma.listing.findMany({
    ...args,
    where: {
      ...(args.where || {}),
      status: { in: ["APPROVED", "ACTIVE", "FEATURED"] },
    },
    include: listingInclude,
  });
}

function findById(id) {
  return prisma.listing.findUnique({
    where: { id },
    include: listingInclude,
  });
}

function findMany(args = {}) {
  return prisma.listing.findMany({
    ...args,
    include: listingInclude,
  });
}

function findManyByOwner(ownerId, args = {}) {
  return prisma.listing.findMany({
    ...args,
    where: {
      ...(args.where || {}),
      ownerId,
    },
    include: listingInclude,
  });
}

function create(data) {
  return prisma.listing.create({
    data,
    include: listingInclude,
  });
}

function update(id, data) {
  return prisma.listing.update({
    where: { id },
    data,
    include: listingInclude,
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
  findMany,
  findManyByOwner,
  create,
  update,
  remove,
};
