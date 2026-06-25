import AdminStatGrid from "../../components/admin/AdminStatGrid.jsx";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import { getBookings } from "../../services/bookingService.js";
import { getUsers } from "../../services/authService.js";
import { getAllItems } from "../../services/itemService.js";
import { formatCurrency } from "../../utils/currency.js";

export default function AdminDashboardPage() {
  const users = getUsers();
  const bookings = getBookings();
  const items = getAllItems();
  const featuredRevenue = items.filter((item) => item.featured).length * 200;
  const subscriptionRevenue = items.filter((item) => item.subscriptionPlan === "Pro Plan").length * 750;
  const verificationRevenue = items.filter((item) => item.verificationStatus === "verified").length * 200;
  const advertisementRevenue = 12400;

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0,
  ) + featuredRevenue + subscriptionRevenue + verificationRevenue + advertisementRevenue;

  const stats = [
    {
      icon: "bi-people",
      label: "Users",
      value: users.length,
    },
    {
      icon: "bi-box-seam",
      label: "Listings",
      value: items.length,
      tone: "success",
    },
    {
      icon: "bi-calendar-check",
      label: "Bookings",
      value: bookings.length,
      tone: "warning",
    },
    {
      icon: "bi-cash-stack",
      label: "Revenue",
      value: formatCurrency(totalRevenue),
      tone: "info",
    },
  ];

  return (
    <main className="dashboard-content">
      <span className="section-label">ADMIN DASHBOARD</span>
      <h1>Platform Overview</h1>

      <AdminStatGrid stats={stats} />

      <h2 className="h4 mb-3">Recent Bookings</h2>
      <AdminDataTable
        columns={[
          { key: "itemTitle", label: "Item" },
          { key: "userName", label: "Renter" },
          {
            key: "totalAmount",
            label: "Amount",
            render: (row) => formatCurrency(row.totalAmount),
          },
          { key: "paymentMethod", label: "Payment" },
          { key: "status", label: "Status" },
        ]}
        rows={bookings.slice(0, 6)}
      />

      <section className="dashboard-section mt-4">
        <div className="owner-section-heading">
          <div>
            <span className="section-label">MARKETPLACE REVENUE</span>
            <h2 className="h4 mb-1">Monetization Channels</h2>
            <p className="owner-muted mb-0">Track subscriptions, featured boosts, verification, and advertisement placements without blocking free entry.</p>
          </div>
        </div>
        <div className="owner-revenue-grid">
          <div className="owner-monetization-card">
            <span>Subscription Revenue</span>
            <strong>{formatCurrency(subscriptionRevenue)}</strong>
            <small>Pro Plan owners with unlimited listings and insights.</small>
          </div>
          <div className="owner-monetization-card">
            <span>Featured Listing Revenue</span>
            <strong>{formatCurrency(featuredRevenue)}</strong>
            <small>3, 7, and 30 day promotion packages.</small>
          </div>
          <div className="owner-monetization-card">
            <span>Verification Revenue</span>
            <strong>{formatCurrency(verificationRevenue)}</strong>
            <small>National ID review and verified owner badges.</small>
          </div>
          <div className="owner-monetization-card">
            <span>Advertisement Revenue</span>
            <strong>{formatCurrency(advertisementRevenue)}</strong>
            <small>Homepage, category, and dashboard banner inventory.</small>
          </div>
        </div>
      </section>
    </main>
  );
}
