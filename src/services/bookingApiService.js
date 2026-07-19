import { apiClient } from "./apiClient.js";

function normalizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function normalizeBooking(booking) {
  if (!booking) return null;

  return {
    ...booking,
    listing: booking.listing || null,
    renter: normalizeUser(booking.renter),
    owner: normalizeUser(booking.owner),
    itemId: booking.listingId || booking.itemId,
    itemTitle:
      booking.listing?.title || booking.itemTitle || booking.title || "Listing",
    totalPrice: Number(booking.totalAmount || booking.totalPrice || 0),
  };
}

function emitBookingsUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("easterncity:bookings-updated"));
  }
}

export async function createBooking(payload) {
  const data = await apiClient.post("/api/bookings", payload);
  emitBookingsUpdate();
  return normalizeBooking(data);
}

export async function getMyBookings() {
  const data = await apiClient.get("/api/bookings");
  return Array.isArray(data) ? data.map(normalizeBooking) : [];
}

export async function acceptBooking(id) {
  const data = await apiClient.patch(`/api/bookings/${id}/accept`);
  emitBookingsUpdate();
  return normalizeBooking(data);
}

export async function rejectBooking(id, reason = "Rejected by owner.") {
  const data = await apiClient.patch(`/api/bookings/${id}/reject`, { reason });
  emitBookingsUpdate();
  return normalizeBooking(data);
}
