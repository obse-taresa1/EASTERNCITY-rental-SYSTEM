const repository = require("../repositories/booking.repository");
const notificationService = require("./notificationService");

async function createBooking(user, payload) {
  const booking = await repository.create({
    renterId: user.id,
    ownerId: payload.ownerId,
    listingId: payload.listingId,
    startDate: new Date(payload.startDate),
    endDate: new Date(payload.endDate),
    subtotal: payload.subtotal,
    serviceFee: payload.serviceFee,
    totalAmount: payload.totalAmount,
    agreementAccepted: Boolean(payload.agreementAccepted),
    status: "PENDING",
  });

  await notificationService.notifyBookingCreated(booking);
  return booking;
}

function getMyBookings(user) {
  return repository.findManyByUser(user.id);
}

async function acceptBooking(user, id) {
  const booking = await repository.findById(id);
  if (!booking || booking.ownerId !== user.id) {
    const error = new Error("Booking not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  const updated = await repository.update(id, {
    status: "ACCEPTED",
    approvedAt: new Date(),
  });

  await notificationService.notifyBookingAccepted(updated);
  return updated;
}

async function rejectBooking(user, id, reason) {
  const booking = await repository.findById(id);
  if (!booking || booking.ownerId !== user.id) {
    const error = new Error("Booking not found or access denied.");
    error.statusCode = 404;
    throw error;
  }

  const updated = await repository.update(id, {
    status: "REJECTED",
    cancellationReason: reason || null,
  });

  await notificationService.notifyBookingRejected(updated);
  return updated;
}

module.exports = { createBooking, getMyBookings, acceptBooking, rejectBooking };
