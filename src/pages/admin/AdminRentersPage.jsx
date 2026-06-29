import { useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const initialRenters = [
  { id: "r-1", name: "Yared Abera", city: "Jigjiga", date: "2026-04-10", reviewsGiven: 5, status: "active" },
  { id: "r-2", name: "Sintayehu Tesfaye", city: "Dire Dawa", date: "2026-05-15", reviewsGiven: 2, status: "active" },
  { id: "r-3", name: "Helena Assefa", city: "Harar", date: "2026-05-20", reviewsGiven: 0, status: "suspended" },
  { id: "r-4", name: "Mohamed Ibrahim", city: "Jigjiga", date: "2026-06-02", reviewsGiven: 7, status: "active" },
];

export default function AdminRentersPage() {
  const [renters, setRenters] = useState(initialRenters);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewingHistory, setViewingHistory] = useState(null);

  const handleToggleStatus = (id) => {
    setRenters(prev =>
      prev.map(r => {
        if (r.id === id) {
          const newStatus = r.status === "active" ? "suspended" : "active";
          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  const filtered = renters.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && r.status === "active") ||
      (filter === "suspended" && r.status === "suspended");
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Renters Management</h1>
          <p className="text-muted mb-0">Monitor platform renters activity, review scores, and bookings.</p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
          <div className="d-flex gap-2">
            {["all", "active", "suspended"].map(opt => (
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
              placeholder="Search by renter name, city..."
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
                <th>Renter Name</th>
                <th>City</th>
                <th>Registration Date</th>
                <th>Reviews Given</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td className="fw-bold">{r.name}</td>
                  <td>{r.city}</td>
                  <td>{r.date}</td>
                  <td>{r.reviewsGiven} Reviews</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className={`btn btn-sm ${r.status === "active" ? "btn-warning text-white" : "btn-primary"}`}
                        onClick={() => handleToggleStatus(r.id)}
                      >
                        {r.status === "active" ? "Suspend" : "Activate"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info"
                        onClick={() => setViewingHistory(r)}
                      >
                        Rental History
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No renters found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingHistory && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title">Rental History for {viewingHistory.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewingHistory(null)}
                />
              </div>
              <div className="modal-body">
                <p className="text-muted">Past rental activity records:</p>
                <div className="list-group list-group-flush">
                  <div className="list-group-item bg-transparent text-color border-0 py-2">
                    <div className="d-flex justify-content-between">
                      <strong>Toyota RAV4</strong>
                      <span className="text-success">Completed</span>
                    </div>
                    <small className="text-muted">Duration: 3 Days | Total Paid: 18,000 ETB</small>
                  </div>
                  <div className="list-group-item bg-transparent text-color border-0 py-2">
                    <div className="d-flex justify-content-between">
                      <strong>Gaming PC</strong>
                      <span className="text-success">Completed</span>
                    </div>
                    <small className="text-muted">Duration: 5 Days | Total Paid: 17,500 ETB</small>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewingHistory(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
