const prisma = require("../config/db");

function findByListing(listingId) {
  return prisma.review.findMany({
    where: { listingId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

function findByUser(userId) {
  return prisma.review.findMany({
    where: { userId },
    include: {
      listing: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

function findAll() {
  return prisma.review.findMany({
    include: {
      listing: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

function findByBooking(bookingId) {
  return prisma.review.findFirst({
    where: { bookingId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

function create(data) {
  return prisma.review.create({
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

module.exports = {
  findByListing,
  findByUser,
  findAll,
  findByBooking,
  create,
};

