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
  const { user } = useAuth();

  const ownedItems = items.filter((item) => {
    return item.owner === user?.businessName || item.owner === user?.name;
  });

  const fallbackOwnedItems = ownedItems.length ? ownedItems : items.slice(0, 3);
  const ownerNames = fallbackOwnedItems.map((item) => item.owner);

  const ownerBookings = ownerNames.flatMap((ownerName) => getBookingsByOwner(ownerName));
  const totalEarnings = ownerBookings.reduce(
    (sum, booking) => sum + booking.totalAmount,
    0
  );

  return (
    <main className="container py-5">
      <div className="dashboard-header">
        <div>
          <span className="section-label">Lessor Dashboard</span>
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
            value={fallbackOwnedItems.length}
          />
        </div>

        <div className="col-md-4">
          <DashboardStatCard
            icon="bi-calendar-check"
            label="Rental Orders"
            value={ownerBookings.length}
            tone="success"
          />
        </div>

        <div className="col-md-4">
          <DashboardStatCard
            icon="bi-wallet2"
            label="Earnings"
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
            <ListingManagementTable items={fallbackOwnedItems} />
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