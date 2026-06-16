import { readStorage, writeStorage } from "./storageService.js";

const BOOKINGS_KEY = "bookings";

export function getBookings() {
  return readStorage(BOOKINGS_KEY, []);
}

export function saveBookings(bookings) {
  writeStorage(BOOKINGS_KEY, bookings);
}

export function addBooking(booking) {
  const bookings = getBookings();
  const nextBookings = [...bookings, booking];

  saveBookings(nextBookings);

  return booking;
}
