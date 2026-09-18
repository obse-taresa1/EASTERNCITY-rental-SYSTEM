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

async function getMyBookings(user) {
  let bookings;
  if (["ADMIN", "SUPER_ADMIN"].includes(String(user.role || "").toUpperCase())) {
    bookings = await repository.findAll();
  } else {
    bookings = await repository.findManyByUser(user.id);
  }

  // Automatic date-based lifecycle
  const now = new Date();
  for (let i = 0; i < bookings.length; i++) {
    const booking = bookings[i];
    if (booking.status === "ACCEPTED" || booking.status === "ACTIVE") {
      const startDate = new Date(booking.startDate);
      const endDate = new Date(booking.endDate);
      
      let newStatus = booking.status;
      // If end date has passed, it's completed
      if (now > endDate) {
        newStatus = "COMPLETED";
      } 
      // Else if start date has been reached, it's active
      else if (now >= startDate && booking.status === "ACCEPTED") {
        newStatus = "ACTIVE";
      }

      if (newStatus !== booking.status) {
        await repository.update(booking.id, { status: newStatus });
        booking.status = newStatus;
      }
    }
  }

  return bookings;
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

async function activateBooking(user, id) {
  const booking = await repository.findById(id);
  if (!booking) {
    const error = new Error("Booking not found.");
    error.statusCode = 404;
    throw error;
  }
  // Owner or renter can mark as active
  if (booking.ownerId !== user.id && booking.renterId !== user.id) {
    const error = new Error("Access denied.");
    error.statusCode = 403;
    throw error;
  }
  if (booking.status !== "ACCEPTED") {
    const error = new Error("Only accepted bookings can be activated.");
    error.statusCode = 400;
    throw error;
  }
  return repository.update(id, { status: "ACTIVE" });
}

async function completeBooking(user, id) {
  const booking = await repository.findById(id);
  if (!booking) {
    const error = new Error("Booking not found.");
    error.statusCode = 404;
    throw error;
  }
  // Owner or renter can mark as completed
  if (booking.ownerId !== user.id && booking.renterId !== user.id) {
    const error = new Error("Access denied.");
    error.statusCode = 403;
    throw error;
  }
  if (booking.status !== "ACTIVE" && booking.status !== "ACCEPTED") {
    const error = new Error("Only active or accepted bookings can be completed.");
    error.statusCode = 400;
    throw error;
  }
  return repository.update(id, { status: "COMPLETED" });
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

module.exports = { createBooking, getMyBookings, acceptBooking, rejectBooking, activateBooking, completeBooking };
