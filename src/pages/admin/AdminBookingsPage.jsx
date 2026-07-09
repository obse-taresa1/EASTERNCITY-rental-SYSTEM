import { useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const initialBookings = [
  { id: "BK-101", itemTitle: "Toyota RAV4", userName: "Yared Abera", startDate: "2026-06-01", endDate: "2026-06-04", totalAmount: 18000, status: "completed" },
  { id: "BK-102", itemTitle: "Gaming PC", userName: "Sintayehu Tesfaye", startDate: "2026-06-10", endDate: "2026-06-15", totalAmount: 17500, status: "accepted" },
  { id: "BK-103", itemTitle: "Dewalt Drill Kit", userName: "Helena Assefa", startDate: "2026-06-20", endDate: "2026-06-21", totalAmount: 1300, status: "pending" },
  { id: "BK-104", itemTitle: "Canon Camera", userName: "Mohamed Ibrahim", startDate: "2026-06-25", endDate: "2026-06-27", totalAmount: 5200, status: "cancelled" },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = bookings.filter(b => {
    const matchesSearch =
      b.itemTitle.toLowerCase().includes(search.toLowerCase()) ||
      b.userName.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Bookings Management</h1>
          <p className="text-muted mb-0">Monitor platform rental bookings. Payments are arranged directly between renters and owners.</p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
          <div className="d-flex gap-2">
            {["all", "pending", "accepted", "active", "completed", "cancelled"].map(opt => (
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
          <div className="search-box" style={{ maxWidth: "300px", width: "100%" }}>
            <input
              type="text"
              placeholder="Search by ID, item, renter..."
              className="form-control"
              value={search}
              onChange={e => setSearch(e.target.value)}
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
              {filtered.map(b => (
                <tr key={b.id}>
                  <td className="fw-bold">{b.id}</td>
                  <td>{b.itemTitle}</td>
                  <td>{b.userName}</td>
                  <td>
                    <div><small>{b.startDate} to</small></div>
                    <div><small>{b.endDate}</small></div>
                  </td>
                  <td className="text-muted">
                    {(() => {
                      if (!b.startDate || !b.endDate) return '—';
                      const days = Math.max(1, Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / (1000*60*60*24)));
                      return `${days} day${days !== 1 ? 's' : ''}`;
                    })()}
                  </td>
                  <td>
                    <StatusBadge status={b.status} />
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
