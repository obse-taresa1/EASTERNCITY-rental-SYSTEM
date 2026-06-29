import { getStorageItem, setStorageItem } from "./storageService.js";

const BOOKINGS_KEY = "rental_bookings";
const REVIEWS_KEY = "rental_reviews";

// ============ BOOKING CRUD ============
export function getBookings() {
  return getStorageItem(BOOKINGS_KEY, []);
}

export function getBookingById(id) {
  if (!id) return null;
  return getBookings().find((b) => b.id === id) || null;
}

export function getBookingsByUser(userId) {
  if (!userId) return [];
  return getBookings().filter(
    (b) =>
      String(b.userId || "").toLowerCase() === String(userId).toLowerCase(),
  );
}

export function getBookingsByOwner(ownerName) {
  if (!ownerName) return [];
  return getBookings().filter(
    (b) =>
      String(b.owner || "").toLowerCase() === String(ownerName).toLowerCase(),
  );
}

export function createBooking(bookingData) {
  if (!bookingData) throw new Error("Booking data is required.");

  const requiredFields = [
    "userId",
    "itemId",
    "itemTitle",
    "owner",
    "startDate",
    "endDate",
  ];
  const missingFields = requiredFields.filter((f) => !bookingData[f]);
  if (missingFields.length > 0)
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);

  const bookings = getBookings();
  const now = new Date();

  const newBooking = {
    id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    // Booking flow status: pending -> accepted -> active -> completed
    status: "pending",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...bookingData,
  };

  setStorageItem(BOOKINGS_KEY, [newBooking, ...bookings]);
  return newBooking;
}

export function updateBookingStatus(id, status) {
  const validStatuses = [
    "pending",
    "accepted",
    "active",
    "completed",
    "cancelled",
  ];
  if (!validStatuses.includes(status))
    throw new Error(`Invalid status: ${status}`);

  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) throw new Error(`Booking ${id} not found.`);

  bookings[idx] = {
    ...bookings[idx],
    status,
    updatedAt: new Date().toISOString(),
  };
  setStorageItem(BOOKINGS_KEY, bookings);
  return bookings[idx];
}

export function deleteBooking(id) {
  const bookings = getBookings();
  const filtered = bookings.filter((b) => b.id !== id);
  if (filtered.length === bookings.length)
    throw new Error(`Booking ${id} not found.`);
  setStorageItem(BOOKINGS_KEY, filtered);
  return true;
}

export function getBookingsByDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) return [];
  return getBookings().filter((b) => {
    const bs = new Date(b.startDate);
    const be = new Date(b.endDate);
    return bs >= start && be <= end;
  });
}

export function getActiveBookings() {
  return getBookings().filter((b) =>
    ["pending", "accepted", "active"].includes(b.status),
  );
}

export function getCompletedBookings() {
  return getBookings().filter((b) => b.status === "completed");
}

export function getCancelledBookings() {
  return getBookings().filter((b) => b.status === "cancelled");
}

// ============ REVIEW SYSTEM ============
export function getReviews() {
  return getStorageItem(REVIEWS_KEY, []);
}

export function getReviewsByItem(itemId) {
  return getReviews().filter((r) => r.itemId === itemId);
}

export function getReviewsByUser(userId) {
  return getReviews().filter((r) => r.userId === userId);
}

export function createReview({
  userId,
  userName,
  itemId,
  itemTitle,
  bookingId,
  rating,
  comment,
}) {
  if (!userId || !itemId || !bookingId || !rating)
    throw new Error("Missing review fields.");
  if (rating < 1 || rating > 5) throw new Error("Rating must be 1-5.");

  const existing = getReviews().find((r) => r.bookingId === bookingId);
  if (existing) throw new Error("Review already submitted for this booking.");

  const review = {
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    userName,
    itemId,
    itemTitle,
    bookingId,
    rating,
    comment: comment || "",
    createdAt: new Date().toISOString(),
  };

  const reviews = getReviews();
  setStorageItem(REVIEWS_KEY, [review, ...reviews]);
  return review;
}

export function hasReviewForBooking(bookingId) {
  return getReviews().some((r) => r.bookingId === bookingId);
}
