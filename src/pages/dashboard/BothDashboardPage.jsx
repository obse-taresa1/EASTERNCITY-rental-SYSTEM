import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState.jsx";
import BookingTable from "../../components/dashboard/BookingTable.jsx";
import DashboardStatCard from "../../components/dashboard/DashboardStatCard.jsx";
import ListingManagementTable from "../../components/dashboard/ListingManagementTable.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getBookingsByOwner, getBookingsByUser } from "../../services/bookingService.js";
import { getAllItems } from "../../services/itemService.js";
import { formatCurrency } from "../../utils/currency.js";

function normalizeStatus(item) {
  return String(item.status || (item.available ? "published" : "expired")).toLowerCase();
}

export default function BothDashboardPage({ initialMode = "renter" }) {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [mode, setMode] = useState(initialMode);
  const allItems = getAllItems();

  const renterBookings = activeUser ? getBookingsByUser(activeUser.id) : [];
  const ownedItems = useMemo(() => {
    const matchesUser = allItems.filter(
      (item) =>
        item.owner === activeUser?.name ||
        item.owner === activeUser?.businessName ||
        item.ownerName === activeUser?.name ||
        item.ownerName === activeUser?.businessName,
    );
    return matchesUser.length ? matchesUser : allItems.slice(0, 6);
  }, [activeUser, allItems]);

  const ownerBookings = ownedItems.flatMap((item) => getBookingsByOwner(item.owner));
  const totalSpent = renterBookings.reduce((sum, booking) => sum + Number(booking.totalAmount || booking.totalPrice || 0), 0);
  const totalEarnings = ownerBookings.reduce((sum, booking) => sum + Number(booking.totalAmount || booking.totalPrice || 0), 0);
  const totalInquiries = ownedItems.reduce((sum, item) => sum + Number(item.inquiries || 0), 0);
  const activeListings = ownedItems.filter((item) => ["published", "active", "featured", "renewed"].includes(normalizeStatus(item))).length;

  return (
    <main className="dashboard-content unified-dashboard">
      <div className="dashboard-header unified-dashboard-header">
        <div>
          <span className="section-label">UNIFIED DASHBOARD</span>
          <h1>{mode === "owner" ? "Owner Mode" : "Renter Mode"}</h1>
          <p className="owner-muted mb-0">Switch modes without leaving your EasternCity workspace.</p>
        </div>

        <div className="dashboard-mode-switch" role="tablist" aria-label="Dashboard mode">
          <button type="button" className={mode === "renter" ? "is-active" : ""} onClick={() => setMode("renter")}>
            <i className="bi bi-bag-check"></i> Renter Mode
          </button>
          <button type="button" className={mode === "owner" ? "is-active" : ""} onClick={() => setMode("owner")}>
            <i className="bi bi-shop"></i> Owner Mode
          </button>
        </div>
      </div>

      {mode === "renter" ? (
        <>
          <div className="row g-4 my-4">
            <div className="col-md-4">
              <DashboardStatCard icon="bi-calendar-check" label="Total Bookings" value={renterBookings.length} />
            </div>
            <div className="col-md-4">
              <DashboardStatCard icon="bi-cash-stack" label="Total Spent" value={formatCurrency(totalSpent)} tone="success" />
            </div>
            <div className="col-md-4">
              <DashboardStatCard icon="bi-shield-check" label="ID Verification" value={activeUser?.verificationStatus || "Pending"} tone="warning" />
            </div>
          </div>

          <section className="dashboard-section premium-dashboard-panel">
            <div className="owner-section-heading mb-3">
              <div>
                <h2 className="h4 mb-1">My Rental Bookings</h2>
                <p className="owner-muted mb-0">Track payments, owner contact, active rentals, and completed reviews.</p>
              </div>
              <Link to="/items" className="btn btn-accent-custom btn-shine">
                <i className="bi bi-search"></i> Browse Items
              </Link>
            </div>

            {renterBookings.length ? (
              <BookingTable bookings={renterBookings} />
            ) : (
              <EmptyState
                icon="bi-calendar-x"
                title="No bookings yet"
                description="Browse nearby rentals and contact verified owners when you find the right item."
                action={<Link to="/items" className="btn btn-accent-custom btn-shine">Browse Items</Link>}
              />
            )}
          </section>
        </>
      ) : (
        <>
          <div className="owner-trust-stat-grid my-4">
            <div className="owner-trust-stat premium-glass-card">
              <i className="bi bi-patch-check"></i>
              <span>Verified Owner</span>
              <strong>{activeUser?.verificationStatus === "Verified" ? "Verified" : "Pending"}</strong>
            </div>
            <div className="owner-trust-stat premium-glass-card">
              <i className="bi bi-chat-dots"></i>
              <span>Total Inquiries</span>
              <strong>{totalInquiries}</strong>
            </div>
            <div className="owner-trust-stat premium-glass-card">
              <i className="bi bi-box-seam"></i>
              <span>Active Listings</span>
              <strong>{activeListings}</strong>
            </div>
          </div>

          <section className="dashboard-section premium-dashboard-panel">
            <div className="owner-section-heading mb-3">
              <div>
                <span className="section-label">OWNER TOOLS</span>
                <h2 className="h4 mb-1">My Listings</h2>
                <p className="owner-muted mb-0">
                  Manage listings, inquiries, promotion, verification, and {formatCurrency(totalEarnings)} in tracked owner earnings.
                </p>
              </div>
              <Link to="/list-item" className="btn btn-accent-custom btn-shine">
                <i className="bi bi-plus-lg"></i> Add New Listing
              </Link>
            </div>

            <ListingManagementTable items={ownedItems} />
          </section>

          <section className="dashboard-section owner-revenue-section mt-4">
            <div className="owner-section-heading">
              <div>
                <span className="section-label">PROMOTE LISTING</span>
                <h2 className="h4 mb-1">Boost Visibility</h2>
                <p className="owner-muted mb-0">Featured listings appear before regular listings and receive premium homepage placement.</p>
              </div>
              <button type="button" className="btn btn-outline-danger">
                <i className="bi bi-arrow-up-circle"></i> Upgrade Plan
              </button>
            </div>
            <div className="promotion-package-row promotion-package-premium">
              {[
                ["3 Days Featured", "100 ETB", "bi-lightning-charge"],
                ["7 Days Featured", "200 ETB", "bi-stars"],
                ["30 Days Featured", "500 ETB", "bi-gem"],
              ].map(([label, price, icon]) => (
                <button type="button" className="promotion-package" key={label}>
                  <i className={`bi ${icon}`}></i>
                  <span>{label}</span>
                  <strong>{price}</strong>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
