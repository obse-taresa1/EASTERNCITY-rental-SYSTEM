import { Link } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState.jsx";
import BookingTable from "../../components/dashboard/BookingTable.jsx";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard.jsx";
import ListingManagementTable from "../../components/dashboard/ListingManagementTable.jsx";
import OwnerEarningsCard from "../../components/dashboard/OwnerEarningsCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { items } from "../../data/items.js";
import {
  getBookingsByOwner,
  getBookingsByUser,
} from "../../services/bookingService.js";
import { formatCurrency } from "../../utils/currency.js";

export default function BothDashboardPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;

  const renterBookings = activeUser ? getBookingsByUser(activeUser.id) : [];
  const ownedItems = items.slice(0, 3);
  const ownerBookings = ownedItems.flatMap((item) =>
    getBookingsByOwner(item.owner),
  );

  const totalSpent = renterBookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0,
  );

  const totalEarnings = ownerBookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0,
  );

  return (
    <main className="dashboard-content">
      <div className="dashboard-header">
        <div>
          <span className="section-label">BOTH DASHBOARD</span>
          <h1>Rent and Manage Listings</h1>
        </div>

        <div className="d-flex gap-2">
          <Link to="/items" className="btn btn-outline-secondary">
            <i className="bi bi-search" /> Rent Items
          </Link>

          <Link to="/list-item" className="btn btn-accent-custom">
            <i className="bi bi-plus-circle" /> Add Listing
          </Link>
        </div>
      </div>

      <div className="row g-4 my-4">
        <div className="col-md-3">
          <DashboardStatCard
            icon="bi-calendar-check"
            label="My Bookings"
            value={renterBookings.length}
          />
        </div>

        <div className="col-md-3">
          <DashboardStatCard
            icon="bi-box-seam"
            label="My Listings"
            value={ownedItems.length}
            tone="success"
          />
        </div>

        <div className="col-md-3">
          <DashboardStatCard
            icon="bi-cash-stack"
            label="Spent"
            value={formatCurrency(totalSpent)}
            tone="warning"
          />
        </div>

        <div className="col-md-3">
          <DashboardStatCard
            icon="bi-wallet2"
            label="Earned"
            value={formatCurrency(totalEarnings)}
            tone="info"
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
            <ListingManagementTable items={ownedItems} />
          </section>
        </div>
      </div>

      <section className="dashboard-section mt-4">
        <h2 className="h4 mb-3">My Rental Bookings</h2>

        {renterBookings.length ? (
          <BookingTable bookings={renterBookings} />
        ) : (
          <EmptyState
            icon="bi-calendar-x"
            title="No rental bookings"
            description="Items you rent will appear here."
          />
        )}
      </section>
    </main>
  );
}
