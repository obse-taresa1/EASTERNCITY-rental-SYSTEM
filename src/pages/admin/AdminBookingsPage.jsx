import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { getMyBookings } from "../../services/bookingApiService.js";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString();
}

function durationDays(startDate, endDate) {
  if (!startDate || !endDate) return "-";
  const days = Math.max(
    1,
    Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24),
    ),
  );
  return `${days} day${days !== 1 ? "s" : ""}`;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;
    getMyBookings().then((data) => {
      if (active) setBookings(data || []);
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = bookings.filter((booking) => {
    const status = String(booking.status || "").toLowerCase();
    const matchesSearch = [
      booking.itemTitle,
      booking.renter?.name,
      booking.renter?.email,
      booking.id,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase()),
      );
    const matchesFilter = filter === "all" || status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Bookings Management</h1>
          <p className="text-muted mb-0">
            Monitor platform rental bookings. Payments are arranged directly
            between renters and owners.
          </p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
          <div className="d-flex gap-2">
            {[
              "all",
              "pending",
              "accepted",
              "active",
              "completed",
              "cancelled",
              "rejected",
            ].map((opt) => (
              <button
                key={opt}
                type="button"
                className={`btn btn-sm ${filter === opt ? "btn-accent-custom" : "btn-outline-secondary"}`}
                onClick={() => setFilter(opt)}
              >
                {opt.toUpperCase()}
              </button>
            ))}
          </div>
          <div
            className="search-box"
            style={{ maxWidth: "300px", width: "100%" }}
          >
            <input
              type="text"
              placeholder="Search by ID, item, renter..."
              className="form-control"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Item</th>
                <th>Renter</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking.id}>
                  <td className="fw-bold">{booking.id}</td>
                  <td>{booking.itemTitle}</td>
                  <td>
                    {booking.renter?.name || booking.renter?.email || "-"}
                  </td>
                  <td>
                    <div>
                      <small>{formatDate(booking.startDate)} to</small>
                    </div>
                    <div>
                      <small>{formatDate(booking.endDate)}</small>
                    </div>
                  </td>
                  <td className="text-muted">
                    {durationDays(booking.startDate, booking.endDate)}
                  </td>
                  <td>
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No bookings found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
