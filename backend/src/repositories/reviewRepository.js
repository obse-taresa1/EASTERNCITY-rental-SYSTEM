const prisma = require('../config/db');

function findByListing(listingId) {
  return prisma.review.findMany({
    where: { listingId },
    orderBy: { createdAt: 'desc' },
  });
}

function findByBooking(bookingId) {
  return prisma.review.findFirst({
    where: { bookingId },
  });
}

function create(data) {
  return prisma.review.create({ data });
}

module.exports = {
  findByListing,
  findByBooking,
  create,
};