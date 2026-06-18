import { Link } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState.jsx";
import BookingTable from "../../components/dashboard/BookingTable.jsx";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard.jsx";
import ListingManagementTable from "../../components/dashboard/ListingManagementTable.jsx";
import OwnerEarningsCard from "../../components/dashboard/OwnerEarningsCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { items } from "../../data/items.js";
import { getBookingsByOwner } from "../../services/bookingService.js";
import { formatCurrency } from "../../utils/currency.js";

export default function LessorDashboardPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;

  const ownedItems = items.filter(
    (item) =>
      item.owner === activeUser?.name ||
      item.owner === activeUser?.businessName,
  );

  const visibleItems = ownedItems.length ? ownedItems : items.slice(0, 3);
  const ownerBookings = visibleItems.flatMap((item) =>
    getBookingsByOwner(item.owner),
  );

  const totalEarnings = ownerBookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0,
  );

  return (
    <main className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <span className="section-label">LESSOR DASHBOARD</span>
          <h1>Manage Listings</h1>
        </div>

        <Link to="/list-item" className="btn btn-accent-custom">
          <i className="bi bi-plus-circle" /> Add Listing
        </Link>
      </div>

      <div className="row g-4 my-4">
        <div className="col-md-4">
          <DashboardStatCard
            icon="bi-box-seam"
            label="Active Listings"
            value={visibleItems.length}
          />
        </div>

        <div className="col-md-4">
          <DashboardStatCard
            icon="bi-calendar-check"
            label="Booking Requests"
            value={ownerBookings.length}
            tone="success"
          />
        </div>

        <div className="col-md-4">
          <DashboardStatCard
            icon="bi-wallet2"
            label="Owner Earnings"
            value={formatCurrency(totalEarnings)}
            tone="warning"
          />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <OwnerEarningsCard
            totalEarnings={totalEarnings}
            bookingCount={ownerBookings.length}
          />
        </div>

        <div className="col-lg-8">
          <section className="dashboard-section">
            <h2 className="h4 mb-3">My Listings</h2>
            <ListingManagementTable items={visibleItems} />
          </section>
        </div>
      </div>

      <section className="dashboard-section mt-4">
        <h2 className="h4 mb-3">Booking Requests</h2>

        {ownerBookings.length ? (
          <BookingTable bookings={ownerBookings} />
        ) : (
          <EmptyState
            icon="bi-calendar-x"
            title="No booking requests"
            description="Bookings for your listings will appear here."
          />
        )}
      </section>
    </main>
  );
}
