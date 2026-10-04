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

async function findPublic(args = {}) {
  const now = new Date();

  const baseWhere = {
    ...(args.where || {}),
    status: { in: ["APPROVED", "ACTIVE", "FEATURED"] },
  };

  const includeWithPromotions = {
    ...listingInclude,
    promotions: {
      where: {
        status: "APPROVED",
        placement: { in: ["Featured Listing", "FEATURED", "FEATURED_LISTING"] },
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      }
    }
  };

  const listings = await prisma.$withRetry(() => prisma.listing.findMany({
    ...args,
    where: baseWhere,
    include: includeWithPromotions,
  }));

  return listings
    .map((listing) => ({
      ...listing,
      isFeatured: Boolean(listing.promotions?.length),
    }))
    .sort((left, right) => Number(right.isFeatured) - Number(left.isFeatured));
}

function findById(id) {
  return prisma.$withRetry(() => prisma.listing.findUnique({
    where: { id },
    include: listingInclude,
  })).then(listing => {
    if (!listing) return null;
    return {
      ...listing,
      isFeatured: listing.promotions && listing.promotions.length > 0
    };
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

async function remove(id) {
  await prisma.listingImage.deleteMany({ where: { listingId: id } });
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
