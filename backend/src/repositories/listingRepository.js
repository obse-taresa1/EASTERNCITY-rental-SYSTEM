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
        startDate: { lte: now },
        endDate: { gte: now }
      }
    }
  };

  const featuredListings = await prisma.listing.findMany({
    ...args,
    where: {
      ...baseWhere,
      promotions: {
        some: {
          status: "APPROVED",
          placement: { in: ["Featured Listing", "FEATURED", "FEATURED_LISTING"] },
          startDate: { lte: now },
          endDate: { gte: now }
        }
      }
    },
    include: includeWithPromotions,
  });

  const featuredIds = featuredListings.map(l => l.id);

  const normalListings = await prisma.listing.findMany({
    ...args,
    where: {
      ...baseWhere,
      id: { notIn: featuredIds.length > 0 ? featuredIds : ["__none__"] }
    },
    include: includeWithPromotions,
  });

  const combined = [...featuredListings, ...normalListings];
  return combined.map(listing => ({
    ...listing,
    isFeatured: listing.promotions && listing.promotions.length > 0
  }));
}

function findById(id) {
  return prisma.listing.findUnique({
    where: { id },
    include: listingInclude,
  }).then(listing => {
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
