import { Link, useParams } from "react-router-dom";
import { getBookingById } from "../../services/bookingService.js";
import { formatCurrency } from "../../utils/currency.js";

export default function BookingSuccessPage() {
  const { bookingId } = useParams();
  const booking = getBookingById(bookingId);

  if (!booking) {
    return (
      <main className="container py-5">
        <h1 className="h4">Booking not found</h1>
        <Link to="/items" className="btn btn-accent-custom mt-3">
          Browse Items
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-5">
      <div className="booking-success text-center mx-auto">
        <i className="bi bi-check-circle-fill display-3 text-success mb-3 d-block" />

        <h1 className="h3 mb-3">Booking Confirmed</h1>
        <p className="text-muted mb-4">
          Your rental request has been saved successfully.
        </p>

        <div className="booking-success-card text-start">
          <p>
            <strong>Item:</strong> {booking.itemTitle}
          </p>
          <p>
            <strong>Total:</strong> {formatCurrency(booking.totalAmount)}
          </p>
          <div className="alert alert-info mb-0">
            <strong>Payment Information</strong>
            <p className="mb-0">
              This platform does not process rental payments. Payment arrangements are made directly with the listing owner.
            </p>
          </div>
        </div>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <Link to="/my-bookings" className="btn btn-accent-custom">
            My Bookings
          </Link>
          <Link to="/items" className="btn btn-outline-secondary">
            Browse More
          </Link>
        </div>
      </div>
    </main>
  );
}
