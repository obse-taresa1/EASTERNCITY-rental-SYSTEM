const repository = require("../repositories/reviewRepository");
const bookingRepository = require("../repositories/booking.repository");
const listingRepository = require("../repositories/listingRepository");
const notificationService = require("./notificationService");

function listByListing(listingId) {
  return repository.findByListing(listingId);
}

function listByUser(userId) {
  return repository.findByUser(userId);
}

async function create(userId, payload) {
  const booking = await bookingRepository.findById(payload.bookingId);

  if (!booking) {
    const error = new Error("Booking not found.");
    error.statusCode = 404;
    throw error;
  }

  if (booking.renterId !== userId) {
    const error = new Error("You can only review your own completed bookings.");
    error.statusCode = 403;
    throw error;
  }

  if (booking.listingId !== payload.listingId) {
    const error = new Error("Listing does not match the booking.");
    error.statusCode = 400;
    throw error;
  }

  if (String(booking.status || "").toUpperCase() !== "COMPLETED") {
    const error = new Error("Only completed bookings can be reviewed.");
    error.statusCode = 400;
    throw error;
  }

  const existing = await repository.findByBooking(payload.bookingId);
  if (existing && existing.userId === userId) {
    const error = new Error("Review already submitted for this booking.");
    error.statusCode = 400;
    throw error;
  }

  const review = await repository.create({
    userId,
    listingId: payload.listingId,
    bookingId: payload.bookingId,
    rating: Number(payload.rating),
    comment: payload.comment || "",
  });

  const listing = await listingRepository.findById(payload.listingId);
  if (listing?.ownerId && listing.ownerId !== userId) {
    await notificationService.notifyReviewAdded(
      review,
      listing.title,
      listing.ownerId,
    );
  }

  return review;
}

module.exports = {
  listByListing,
  listByUser,
  create,
};
