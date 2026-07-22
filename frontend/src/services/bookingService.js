import {
  createNotification,
  NOTIFICATION_TYPES,
} from "./notificationService.js";
import { getStorageItem, setStorageItem } from "./storageService.js";
import { apiClient } from "./apiClient.js";
import { getAuthTokens } from "./authService.js";

const BOOKINGS_KEY = "rental_bookings";
const REVIEWS_KEY = "rental_reviews";
const VALID_BOOKING_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];

function normalizeBookingStatus(status) {
  const nextStatus = String(status || "PENDING").toUpperCase();
  if (!VALID_BOOKING_STATUSES.includes(nextStatus)) {
    throw new Error(`Invalid status: ${status}`);
  }
  return nextStatus;
}

export function getBookings() {
  return getStorageItem(BOOKINGS_KEY, []);
}

export async function fetchBookings() {
  const accessToken = getAuthTokens().accessToken;
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";
  if (useMock || !accessToken) {
    return getBookings();
  }

  const data = await apiClient.get("/api/bookings");
  return Array.isArray(data) ? data : [];
}

export async function fetchBookingById(id) {
  const accessToken = getAuthTokens().accessToken;
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";
  if (useMock || !accessToken) {
    return getBookingById(id);
  }
  return await apiClient.get(`/api/bookings/${id}`);
}

export async function createBookingAsync(bookingData) {
  const accessToken = getAuthTokens().accessToken;
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";
  if (useMock || !accessToken) {
    return Promise.resolve(createBooking(bookingData));
  }
  const data = await apiClient.post("/api/bookings", bookingData);
  return data;
}

export async function updateBookingStatusAsync(id, status) {
  const accessToken = getAuthTokens().accessToken;
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";
  if (useMock || !accessToken) {
    return Promise.resolve(updateBookingStatus(id, status));
  }
  const data = await apiClient.patch(`/api/bookings/${id}/status`, { status });
  return data;
}

export async function deleteBookingAsync(id) {
  const accessToken = getAuthTokens().accessToken;
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";
  if (useMock || !accessToken) {
    return Promise.resolve(deleteBooking(id));
  }
  const data = await apiClient.delete(`/api/bookings/${id}`);
  return data;
}

export function getBookingById(id) {
  if (!id) return null;
  return getBookings().find((booking) => booking.id === id) || null;
}

export function getBookingsByUser(userId) {
  if (!userId) return [];
  return getBookings().filter(
    (booking) =>
      String(booking.renterId || booking.userId || "").toLowerCase() ===
      String(userId).toLowerCase(),
  );
}

export function getBookingsByOwner(ownerIdentifier) {
  if (!ownerIdentifier) return [];
  const lookup = String(ownerIdentifier).toLowerCase();
  return getBookings().filter((booking) => {
    const ownerValues = [
      booking.ownerId,
      booking.owner,
      booking.ownerName,
    ].filter(Boolean);
    return ownerValues.some((value) => String(value).toLowerCase() === lookup);
  });
}

export function createBooking(bookingData) {
  if (!bookingData) throw new Error("Booking data is required.");

  const requiredFields = [
    "renterId",
    "ownerId",
    "listingId",
    "startDate",
    "endDate",
  ];
  const missingFields = requiredFields.filter((field) => !bookingData[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  const bookings = getBookings();
  const now = new Date();

  const newBooking = {
    id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    renterId: bookingData.renterId,
    ownerId: bookingData.ownerId,
    listingId: bookingData.listingId,
    startDate: bookingData.startDate,
    endDate: bookingData.endDate,
    subtotal: Number(bookingData.subtotal || 0),
    serviceFee: Number(bookingData.serviceFee || 0),
    totalAmount: Number(bookingData.totalAmount || 0),
    agreementAccepted: Boolean(bookingData.agreementAccepted),
    cancellationReason: bookingData.cancellationReason || "",
    approvedAt: bookingData.approvedAt || null,
    completedAt: bookingData.completedAt || null,
    createdAt: bookingData.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
    ...bookingData,
    status: normalizeBookingStatus(bookingData.status),
  };

  setStorageItem(BOOKINGS_KEY, [newBooking, ...bookings]);
  createNotification({
    userId: newBooking.ownerId,
    title: "New booking request received",
    body: `${newBooking.itemTitle || "A listing"} has a new booking request.`,
    type: NOTIFICATION_TYPES.BOOKING_CREATED,
    referenceId: newBooking.id,
    referenceType: "BOOKING",
  });
  return newBooking;
}

export function updateBookingStatus(id, status) {
  const nextStatus = normalizeBookingStatus(status);

  const bookings = getBookings();
  const index = bookings.findIndex((booking) => booking.id === id);
  if (index === -1) throw new Error(`Booking ${id} not found.`);

  bookings[index] = {
    ...bookings[index],
    status: nextStatus,
    approvedAt:
      nextStatus === "ACCEPTED"
        ? new Date().toISOString()
        : bookings[index].approvedAt,
    completedAt:
      nextStatus === "COMPLETED"
        ? new Date().toISOString()
        : bookings[index].completedAt,
    updatedAt: new Date().toISOString(),
  };

  setStorageItem(BOOKINGS_KEY, bookings);

  if (nextStatus === "ACCEPTED" || nextStatus === "REJECTED") {
    createNotification({
      userId: bookings[index].renterId || bookings[index].userId,
      title:
        nextStatus === "ACCEPTED"
          ? "Your booking request was accepted"
          : "Your booking request was rejected",
      body: `${bookings[index].itemTitle || "Your booking"} was ${nextStatus.toLowerCase()}.`,
      type:
        nextStatus === "ACCEPTED"
          ? NOTIFICATION_TYPES.BOOKING_ACCEPTED
          : NOTIFICATION_TYPES.BOOKING_REJECTED,
      referenceId: bookings[index].id,
      referenceType: "BOOKING",
    });
  }

  return bookings[index];
}

export function deleteBooking(id) {
  const bookings = getBookings();
  const filtered = bookings.filter((booking) => booking.id !== id);
  if (filtered.length === bookings.length) {
    throw new Error(`Booking ${id} not found.`);
  }
  setStorageItem(BOOKINGS_KEY, filtered);
  return true;
}

export function getBookingsByDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  return getBookings().filter((booking) => {
    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);
    return bookingStart >= start && bookingEnd <= end;
  });
}

export function getActiveBookings() {
  return getBookings().filter((booking) =>
    ["PENDING", "ACCEPTED", "ACTIVE"].includes(
      normalizeBookingStatus(booking.status),
    ),
  );
}

export function getCompletedBookings() {
  return getBookings().filter(
    (booking) => normalizeBookingStatus(booking.status) === "COMPLETED",
  );
}

export function getCancelledBookings() {
  return getBookings().filter(
    (booking) => normalizeBookingStatus(booking.status) === "CANCELLED",
  );
}

export function getReviews() {
  return getStorageItem(REVIEWS_KEY, []);
}

export function getReviewsByItem(itemId) {
  return getReviews().filter((review) => review.itemId === itemId);
}

export function getReviewsByUser(userId) {
  return getReviews().filter((review) => review.userId === userId);
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
  if (!userId || !itemId || !bookingId || !rating) {
    throw new Error("Missing review fields.");
  }
  if (rating < 1 || rating > 5) throw new Error("Rating must be 1-5.");

  const existing = getReviews().find(
    (review) => review.bookingId === bookingId,
  );
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
  return getReviews().some((review) => review.bookingId === bookingId);
}
