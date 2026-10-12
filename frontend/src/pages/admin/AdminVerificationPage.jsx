import { useEffect, useState } from "react";
import {
  getVerificationRequests,
  reviewVerificationRequest,
} from "../../services/verificationApiService.js";

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState([]);
  const [selectedID, setSelectedID] = useState(null);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    setNotice("");
    try {
      setRequests(await getVerificationRequests());
    } catch (error) {
      setNotice(error.response?.data?.message || "Failed to load verification requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (request, status) => {
    let reason = "";
    if (status === "REJECTED") {
      reason = window.prompt("Enter the reason for rejecting this verification request:", "");
      if (reason === null) return;
      if (!reason.trim()) {
        setNotice("A rejection reason is required.");
        return;
      }
    }

    setIsLoading(true);
    try {
      await reviewVerificationRequest(request.id, status, reason.trim());
      setNotice(
        status === "APPROVED"
          ? "Verification request approved."
          : "Verification request rejected and the reason was sent to the user.",
      );
      await fetchRequests();
    } catch (error) {
      setNotice(error.response?.data?.message || "Failed to update verification status.");
      setIsLoading(false);
    }
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

      {notice && <div className="alert alert-warning">{notice}</div>}

      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Location</th>
                <th>ID Documents</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const status = String(request.status || "PENDING").toUpperCase();
                return (
                  <tr key={request.id}>
                    <td>
                      <div className="fw-bold">{request.userName || "User"}</div>
                      <small className="text-muted">{request.userEmail || "-"}</small>
                    </td>
                    <td>
                      <span>{[request.city, request.sefer].filter(Boolean).join(" · ") || "-"}</span>
                      {request.address && <small className="d-block text-muted">{request.address}</small>}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedID({ ...request, side: "Front", url: request.nationalIdFrontUrl })}>ID Front</button>
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedID({ ...request, side: "Back", url: request.nationalIdBackUrl })}>ID Back</button>
                      </div>
                    </td>
                    <td>
                      {status === "PENDING" && <span className="badge bg-warning-subtle text-warning">Pending</span>}
                      {status === "APPROVED" && <span className="badge bg-success-subtle text-success">Approved</span>}
                      {status === "REJECTED" && <span className="badge bg-danger-subtle text-danger">Rejected</span>}
                    </td>
                    <td>
                      {status === "PENDING" ? (
                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-sm btn-success" disabled={isLoading} onClick={() => handleAction(request, "APPROVED")}>Approve</button>
                          <button type="button" className="btn btn-sm btn-danger" disabled={isLoading} onClick={() => handleAction(request, "REJECTED")}>Reject</button>
                        </div>
                      ) : (
                        <span className="text-muted"><small>Resolved</small></span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedID && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title">National ID ({selectedID.side}) - {selectedID.userName || "User"}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedID(null)} />
              </div>
              <div className="modal-body text-center">
                <div className="p-5 border rounded mb-3" style={{ backgroundColor: "rgba(227, 30, 36, 0.03)", borderStyle: "dashed", borderColor: "var(--primary-color)", minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  {selectedID.url ? (
                    <img src={selectedID.url} alt={`${selectedID.side} ID`} className="img-fluid rounded" />
                  ) : (
                    <>
                      <i className="bi bi-card-image text-danger" style={{ fontSize: "4rem" }} />
                      <p className="fw-bold mt-2">No {selectedID.side} document uploaded</p>
                    </>
                  )}
                  <small className="text-muted">{[selectedID.city, selectedID.sefer].filter(Boolean).join(" · ") || "No location provided"}</small>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedID(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
