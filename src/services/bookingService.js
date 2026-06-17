import { getStorageItem, setStorageItem } from "./storageService.js";

const BOOKINGS_KEY = "rental_bookings";

export function getBookings() {
  return getStorageItem(BOOKINGS_KEY, []);
}

export function getBookingById(id) {
  if (!id) {
    return null;
  }

  // Error 1: Fixed missing || operator
  return getBookings().find((booking) => booking.id === id) || null;
}

export function getBookingsByUser(userId) {
  if (!userId) {
    return [];
  }

  // Error 2: Fixed missing || operator
  return getBookings().filter(
    (booking) =>
      String(booking.userId || "").toLowerCase() ===
      String(userId).toLowerCase(),
  );
}

export function getBookingsByOwner(ownerName) {
  if (!ownerName) {
    return [];
  }

  // Error 3: Fixed missing || operator
  return getBookings().filter(
    (booking) =>
      String(booking.owner || "").toLowerCase() ===
      String(ownerName).toLowerCase(),
  );
}

export function createBooking(bookingData) {
  if (!bookingData) {
    throw new Error("Booking data is required.");
  }

  const requiredFields = [
    "userId",
    "itemId",
    "itemTitle",
    "owner",
    "startDate",
    "endDate",
    "paymentMethod",
  ];

  const missingFields = requiredFields.filter((field) => !bookingData[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  const bookings = getBookings();
  const now = new Date();

  const newBooking = {
    id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "pending",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...bookingData,
  };

  setStorageItem(BOOKINGS_KEY, [newBooking, ...bookings]);

  return newBooking;
}

export function updateBookingStatus(id, status) {
  const validStatuses = ["pending", "confirmed", "cancelled", "completed"];

  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const bookings = getBookings();
  const bookingIndex = bookings.findIndex((booking) => booking.id === id);

  if (bookingIndex === -1) {
    throw new Error(`Booking with ID ${id} not found.`);
  }

  bookings[bookingIndex] = {
    ...bookings[bookingIndex],
    status,
    updatedAt: new Date().toISOString(),
  };

  setStorageItem(BOOKINGS_KEY, bookings);

  return bookings[bookingIndex];
}

export function deleteBooking(id) {
  // Error 5: Fixed to throw error if not found
  const bookings = getBookings();
  const initialLength = bookings.length;
  const filteredBookings = bookings.filter((booking) => booking.id !== id);

  if (filteredBookings.length === initialLength) {
    throw new Error(`Booking with ID ${id} not found.`);
  }

  setStorageItem(BOOKINGS_KEY, filteredBookings);
  return true;
}

export function getBookingsByDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Error 4: Fixed missing || operator
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return [];
  }

  return getBookings().filter((booking) => {
    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);

    return bookingStart >= start && bookingEnd <= end;
  });
}

export function getActiveBookings() {
  return getBookings().filter(
    (booking) => booking.status === "confirmed" || booking.status === "pending",
  );
}

export function getCompletedBookings() {
  return getBookings().filter((booking) => booking.status === "completed");
}

export function getCancelledBookings() {
  return getBookings().filter((booking) => booking.status === "cancelled");
}