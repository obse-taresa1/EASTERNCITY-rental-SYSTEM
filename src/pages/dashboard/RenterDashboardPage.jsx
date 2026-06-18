import { Link } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState.jsx";
import BookingTable from "../../components/dashboard/BookingTable.jsx";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getBookingsByUser } from "../../services/bookingService.js";
import { formatCurrency } from "../../utils/currency.js";

export default function RenterDashboardPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;

  const bookings = activeUser ? getBookingsByUser(activeUser.id) : [];

  const totalSpent = bookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0,
  );

  return (
    <main className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <span className="section-label">RENTER DASHBOARD</span>
          <h1>Welcome, {activeUser?.name || "Renter"}</h1>
        </div>

        <Link to="/items" className="btn btn-accent-custom">
          <i className="bi bi-search" /> Browse Items
        </Link>
      </div>

      <div className="row g-4 my-4">
        <div className="col-md-4">
          <DashboardStatCard
            icon="bi-calendar-check"
            label="Total Bookings"
            value={bookings.length}
          />
        </div>

        <div className="col-md-4">
          <DashboardStatCard
            icon="bi-cash-stack"
            label="Total Spent"
            value={formatCurrency(totalSpent)}
            tone="success"
          />
        </div>

        <div className="col-md-4">
          <DashboardStatCard
            icon="bi-phone"
            label="Payment Methods"
            value="3"
            tone="warning"
          />
        </div>
      </div>

      <section className="dashboard-section">
        <h2 className="h4 mb-3">Recent Bookings</h2>

        {bookings.length ? (
          <BookingTable bookings={bookings} />
        ) : (
          <EmptyState
            icon="bi-calendar-x"
            title="No bookings yet"
            description="Start by browsing available rental items."
            action={
              <Link to="/items" className="btn btn-accent-custom">
                Browse Items
              </Link>
            }
          />
        )}
      </section>
    </main>
  );
}
