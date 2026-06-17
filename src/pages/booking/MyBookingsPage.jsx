import EmptyState from "../../components/common/EmptyState.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getBookingsByUser } from "../../services/bookingService.js";
import { formatCurrency } from "../../utils/currency.js";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const bookings = user ? getBookingsByUser(user.id) : [];

  return (
    <main className="container py-5">
      <h1 className="h3 mb-4">My Bookings</h1>

      {!bookings.length ? (
        <EmptyState
          icon="bi-calendar-x"
          title="No bookings yet"
          description="Your rental bookings will appear here."
        />
      ) : (
        <div className="row g-4">
          {bookings.map((booking) => (
            <div className="col-lg-6" key={booking.id}>
              <div className="booking-card">
                <div className="d-flex gap-3">
                  <img src={booking.itemImage} alt={booking.itemTitle} />
                  <div>
                    <h2 className="h5">{booking.itemTitle}</h2>
                    <p className="text-muted mb-1">
                      {booking.startDate} to {booking.endDate}
                    </p>
                    <p className="mb-1">
                      <strong>Total:</strong> {formatCurrency(booking.totalAmount)}
                    </p>
                    <p className="mb-1">
                      <strong>Payment Method:</strong> {booking.paymentMethod}
                    </p>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}