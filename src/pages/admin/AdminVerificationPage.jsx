import { useEffect, useState } from "react";
import {
  getVerificationRequests,
  reviewVerificationRequest,
} from "../../services/verificationApiService.js";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadge(status) {
  const normalized = String(status || "PENDING").toLowerCase();
  if (normalized === "approved") {
    return <span className="badge bg-success-subtle text-success">Approved</span>;
  }
  if (normalized === "rejected") {
    return <span className="badge bg-danger-subtle text-danger">Rejected</span>;
  }
  return <span className="badge bg-warning-subtle text-warning">Pending</span>;
}

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState([]);
  const [selectedID, setSelectedID] = useState(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    setLoading(true);
    try {
      const data = await getVerificationRequests();
      setRequests(data);
    } catch (error) {
      setNotice(error.message || "Unable to load verification requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleAction(id, newStatus) {
    try {
      const reason =
        newStatus === "REJECTED"
          ? window.prompt("Enter rejection reason") || "Rejected by admin."
          : "";
      await reviewVerificationRequest(id, newStatus, reason);
      await loadRequests();
      setNotice(`Verification request ${newStatus.toLowerCase()}.`);
    } catch (error) {
      setNotice(error.message || "Unable to update verification request.");
    }
  }

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

      {notice && <div className="alert alert-info">{notice}</div>}

      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Location</th>
                <th>ID Documents</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Loading verification requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No verification requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request) => {
                  const isPending =
                    String(request.status || "").toUpperCase() === "PENDING";

                  return (
                    <tr key={request.id}>
                      <td>
                        <div className="fw-bold">{request.userName || "User"}</div>
                        <small className="text-muted">
                          {request.userEmail || "-"}
                        </small>
                      </td>
                      <td>
                        <div>{request.city || "-"}</div>
                        <small className="text-muted">
                          {[request.sefer, request.address].filter(Boolean).join(", ") ||
                            "-"}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              setSelectedID({
                                ...request,
                                side: "Front",
                                imageUrl: request.nationalIdFrontUrl,
                              })
                            }
                          >
                            ID Front
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              setSelectedID({
                                ...request,
                                side: "Back",
                                imageUrl: request.nationalIdBackUrl,
                              })
                            }
                          >
                            ID Back
                          </button>
                        </div>
                      </td>
                      <td>{formatDate(request.submittedAt)}</td>
                      <td>{statusBadge(request.status)}</td>
                      <td>
                        {isPending ? (
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-success"
                              onClick={() => handleAction(request.id, "APPROVED")}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleAction(request.id, "REJECTED")}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">
                            <small>Resolved</small>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedID && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  National ID ({selectedID.side}) - {selectedID.userName || "User"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedID(null)}
                />
              </div>
              <div className="modal-body text-center">
                {selectedID.imageUrl ? (
                  <img
                    src={selectedID.imageUrl}
                    alt={`National ID ${selectedID.side}`}
                    className="img-fluid rounded border"
                    style={{ maxHeight: "70vh" }}
                  />
                ) : (
                  <div className="p-5 border rounded mb-3">
                    <i
                      className="bi bi-card-image text-danger"
                      style={{ fontSize: "4rem" }}
                    />
                    <p className="fw-bold mt-2">No document image available</p>
                  </div>
                )}
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
