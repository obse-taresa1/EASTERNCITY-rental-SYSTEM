import { useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";

const initialReports = [
  { id: "rep-1", reporter: "Yared Abera", type: "Listing Report", subject: "Toyota RAV4", details: "Listing says price is 6000 ETB, but owner demands 8500 ETB in private messages.", status: "pending" },
  { id: "rep-2", reporter: "Sintayehu Tesfaye", type: "Owner Report", subject: "Tech Hub Rentals", details: "Owner was abusive during pickup and didn't provide power cable.", status: "pending" },
  { id: "rep-3", reporter: "Helena Assefa", type: "User Complaint", subject: "False claims", details: "Renter left review claiming drill was broken, but it works perfectly.", status: "resolved" },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState(initialReports);
  const [filter, setFilter] = useState("all");
  const [viewingDetails, setViewingDetails] = useState(null);

  const handleAction = (id, newStatus) => {
    setReports(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const filtered = reports.filter(r => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Reports & Complaints</h1>
          <p className="text-muted mb-0">
            Handle platform dispute reviews, report tickets, and user complaints.
          </p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="d-flex gap-2 mb-4">
          {["all", "pending", "resolved"].map(opt => (
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

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Type</th>
                <th>Reporter</th>
                <th>Subject/Target</th>
                <th>Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <span className="badge bg-danger-subtle text-danger">{r.type}</span>
                  </td>
                  <td>{r.reporter}</td>
                  <td className="fw-bold">{r.subject}</td>
                  <td>
                    <div className="text-truncate" style={{ maxWidth: "250px" }}>{r.details}</div>
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info"
                        onClick={() => setViewingDetails(r)}
                      >
                        Review
                      </button>
                      {r.status === "pending" && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => handleAction(r.id, "resolved")}
                          >
                            Resolve
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleAction(r.id, "dismissed")}
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No reports found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingDetails && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title">Dispute Report Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewingDetails(null)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Report Type:</strong> <span className="text-danger">{viewingDetails.type}</span>
                </div>
                <div className="mb-3">
                  <strong>Reporter:</strong> {viewingDetails.reporter}
                </div>
                <div className="mb-3">
                  <strong>Subject/Target:</strong> <span className="fw-bold">{viewingDetails.subject}</span>
                </div>
                <div className="mb-3">
                  <strong>Complaint Details:</strong>
                  <p className="p-3 border rounded mt-1 bg-light text-dark">{viewingDetails.details}</p>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setViewingDetails(null)}
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
