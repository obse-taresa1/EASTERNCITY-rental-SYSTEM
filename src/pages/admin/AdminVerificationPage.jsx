import { useState } from "react";

const initialRequests = [
  { id: "vr-1", name: "Almaz Belay", email: "almaz@example.com", phone: "+251 912 345678", idNumber: "NID-908123", status: "pending" },
  { id: "vr-2", name: "Yonas Kassa", email: "yonas@example.com", phone: "+251 922 987654", idNumber: "NID-704928", status: "pending" },
  { id: "vr-3", name: "Fatuma Mohammed", email: "fatuma@example.com", phone: "+251 933 504938", idNumber: "NID-504930", status: "approved" },
];

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedID, setSelectedID] = useState(null);

  const handleAction = (id, newStatus) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Verification Requests</h1>
          <p className="text-muted mb-0">
            Verify user identity using submitted government-issued National IDs.
          </p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>User Details</th>
                <th>National ID Number</th>
                <th>ID Documents</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="fw-bold">{r.name}</div>
                    <small className="text-muted">{r.email} | {r.phone}</small>
                  </td>
                  <td><code>{r.idNumber}</code></td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setSelectedID({ ...r, side: "Front" })}
                      >
                        ID Front
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setSelectedID({ ...r, side: "Back" })}
                      >
                        ID Back
                      </button>
                    </div>
                  </td>
                  <td>
                    {r.status === "pending" && (
                      <span className="badge bg-warning-subtle text-warning">Pending</span>
                    )}
                    {r.status === "approved" && (
                      <span className="badge bg-success-subtle text-success">Approved</span>
                    )}
                    {r.status === "rejected" && (
                      <span className="badge bg-danger-subtle text-danger">Rejected</span>
                    )}
                  </td>
                  <td>
                    {r.status === "pending" && (
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={() => handleAction(r.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleAction(r.id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status !== "pending" && (
                      <span className="text-muted"><small>Resolved</small></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedID && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  National ID ({selectedID.side}) - {selectedID.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedID(null)}
                />
              </div>
              <div className="modal-body text-center">
                <div
                  className="p-5 border rounded mb-3"
                  style={{
                    backgroundColor: "rgba(227, 30, 36, 0.03)",
                    borderStyle: "dashed",
                    borderColor: "var(--primary-color)",
                    minHeight: "200px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <i className="bi bi-card-image text-danger" style={{ fontSize: "4rem" }} />
                  <p className="fw-bold mt-2">Mock {selectedID.side} Document Scan</p>
                  <small className="text-muted">ID Number: {selectedID.idNumber}</small>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedID(null)}
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
