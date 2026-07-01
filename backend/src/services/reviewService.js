const repository = require('../repositories/reviewRepository');

function listByListing(listingId) {
  return repository.findByListing(listingId);
}

async function create(userId, payload) {
  const existing = await repository.findByBooking(payload.bookingId);
  if (existing) {
    const error = new Error('Review already submitted for this booking.');
    error.statusCode = 400;
    throw error;
  }

  return repository.create({
    userId,
    listingId: payload.listingId,
    bookingId: payload.bookingId,
    rating: Number(payload.rating),
    comment: payload.comment || '',
  });
}

module.exports = {
  listByListing,
  create,
};