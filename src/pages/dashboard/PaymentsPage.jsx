import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyBookings } from "../../services/bookingApiService.js";
import { Link } from "react-router-dom";

const PAYMENT_STATUS_MAP = {
  pending: { label: "Pending Payment", cls: "pay-status-pending", icon: "bi-clock" },
  screenshot_uploaded: { label: "Screenshot Uploaded", cls: "pay-status-uploaded", icon: "bi-upload" },
  awaiting_verification: { label: "Awaiting Verification", cls: "pay-status-waiting", icon: "bi-hourglass-split" },
  approved: { label: "Paid", cls: "pay-status-paid", icon: "bi-check-circle-fill" },
  rejected: { label: "Rejected", cls: "pay-status-rejected", icon: "bi-x-circle-fill" },
  completed: { label: "Completed", cls: "pay-status-paid", icon: "bi-flag-fill" },
};

export default function PaymentsPage() {
  const { currentUser, user } = useAuth();
  const activeUser = user || currentUser;
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      if (!activeUser?.id) {
        setBookings([]);
        return;
      }

      const data = await getMyBookings().catch(() => []);
      if (active) setBookings(data);
    }

    loadBookings();

    return () => {
      active = false;
    };
  }, [activeUser?.id]);

  const pending = bookings.filter((b) =>
    ["pending", "screenshot_uploaded", "awaiting_verification"].includes(b.paymentStatus || b.status),
  );
  const paid = bookings.filter((b) =>
    ["approved", "confirmed", "active", "completed"].includes(b.paymentStatus || b.status),
  );

  const totalPaid = paid.reduce(
    (sum, b) => sum + Number(b.totalAmount || b.totalPrice || 0),
    0,
  );

  function renderRow(booking) {
    const ps = booking.paymentStatus || booking.status || "pending";
    const statusInfo = PAYMENT_STATUS_MAP[ps] || PAYMENT_STATUS_MAP.pending;
    const amount = Number(booking.totalAmount || booking.totalPrice || 0);

    return (
      <div className="pay-row ud-glass-card" key={booking.id}>
        <div className="pay-row-left">
          <div className={`pay-row-icon ${statusInfo.cls}`}>
            <i className={`bi ${statusInfo.icon}`} />
          </div>
          <div className="pay-row-info">
            <strong>{booking.itemTitle || "Rental Item"}</strong>
            <span className="pay-booking-id">ID: #{booking.id?.slice(-8)}</span>
            <span className="pay-dates">
              <i className="bi bi-calendar3" />
              {booking.startDate} → {booking.endDate}
            </span>
          </div>
        </div>
        <div className="pay-row-center">
          <div className="pay-method">
            <i className="bi bi-credit-card" />
            {booking.paymentMethod?.toUpperCase() || "N/A"}
          </div>
          <span className={`pay-status-badge ${statusInfo.cls}`}>
            <i className={`bi ${statusInfo.icon}`} />
            {statusInfo.label}
          </span>
        </div>
        <div className="pay-row-right">
          <strong className="pay-amount">ETB {amount.toLocaleString()}</strong>
          {booking.status === "pending" && (
            <Link to={`/booking/${booking.itemId}`} className="ud-btn-red ud-btn-sm">
              Pay Now
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ud-page">
      <div className="ud-page-header">
        <div>
          <span className="ud-label">FINANCES</span>
          <h1 className="ud-page-title">Payments</h1>
          <p className="ud-page-sub">Track all your rental payments in one place.</p>
        </div>
        <div className="ud-summary-chips">
          <div className="ud-chip ud-chip-green">
            <i className="bi bi-check-circle" />
            <div>
              <strong>ETB {totalPaid.toLocaleString()}</strong>
              <span>Total Paid</span>
            </div>
          </div>
          <div className="ud-chip ud-chip-yellow">
            <i className="bi bi-clock" />
            <div>
              <strong>{pending.length}</strong>
              <span>Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      <section className="ud-section">
        <h2 className="ud-section-title">
          <i className="bi bi-hourglass-split text-warning" /> Pending Payments
          <span className="ud-count-badge">{pending.length}</span>
        </h2>
        {pending.length === 0 ? (
          <div className="ud-empty-state">
            <i className="bi bi-check-circle text-success" />
            <p>No pending payments. You're all caught up!</p>
          </div>
        ) : (
          <div className="pay-list">{pending.map(renderRow)}</div>
        )}
      </section>

      {/* Completed Payments */}
      <section className="ud-section">
        <h2 className="ud-section-title">
          <i className="bi bi-check-circle-fill text-success" /> Completed Payments
          <span className="ud-count-badge">{paid.length}</span>
        </h2>
        {paid.length === 0 ? (
          <div className="ud-empty-state">
            <i className="bi bi-credit-card" />
            <p>No completed payments yet.</p>
            <Link to="/items" className="ud-btn-outline">Browse Items</Link>
          </div>
        ) : (
          <div className="pay-list">{paid.map(renderRow)}</div>
        )}
      </section>
    </div>
  );
}
