import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import {
  approvePromotionRequest,
  fetchPromotionRequests,
  rejectPromotionRequest,
} from "../../services/promotionService.js";

const filters = ["all", "Pending", "Approved", "Rejected"];

export default function SuperPromotionManagementPage({ scope = "superadmin" }) {
  const [promotions, setPromotions] = useState(() => fetchPromotionRequests());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const sectionLabel = scope === "admin" ? "ADMIN" : "SUPER ADMIN";

  useEffect(() => {
    const refreshPromotions = () => {
      const requests = fetchPromotionRequests();
      console.log("Promotion Management Requests:", requests);
      setPromotions(requests);
    };

    refreshPromotions();
    window.addEventListener("easterncity:promotions-updated", refreshPromotions);
    return () =>
      window.removeEventListener(
        "easterncity:promotions-updated",
        refreshPromotions,
      );
  }, []);

  const handleApprove = (id) => {
    const updated = approvePromotionRequest(id);
    setPromotions(fetchPromotionRequests());
    if (selectedRequest?.id === id && updated) {
      setSelectedRequest(updated);
    }
  };

  const handleReject = (id) => {
    const updated = rejectPromotionRequest(id);
    setPromotions(fetchPromotionRequests());
    if (selectedRequest?.id === id && updated) {
      setSelectedRequest(updated);
    }
  };

  const filtered = promotions.filter((promotion) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch =
      String(promotion.listingTitle || "").toLowerCase().includes(searchTerm) ||
      String(promotion.userName || promotion.ownerName || "").toLowerCase().includes(searchTerm);
    const matchesFilter =
      filter === "all" ||
      String(promotion.status || "").toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">{sectionLabel}</span>
          <h1 className="h3 mb-0">Promotion Management</h1>
          <p className="text-muted mb-0">
            Review and approve featured listing packages and payment proofs.
          </p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
          <div className="d-flex gap-2">
            {filters.map((status) => (
              <button
                key={status}
                type="button"
                className={`btn btn-sm ${
                  filter === status
                    ? "btn-accent-custom"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setFilter(status)}
              >
                {status.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="search-box" style={{ maxWidth: "300px", width: "100%" }}>
            <input
              type="text"
              placeholder="Search listing or user..."
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
                <th>Listing</th>
                <th>User</th>
                <th>Promotion Type</th>
                <th>Amount</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((promotion) => (
                <tr key={promotion.id}>
                  <td>
                    <div className="fw-bold">{promotion.listingTitle}</div>
                    <small className="text-muted">{promotion.listingId}</small>
                  </td>
                  <td>{promotion.userName || promotion.ownerName}</td>
                  <td>
                    <span className="badge bg-danger-subtle text-danger">
                      {promotion.promotionType}
                    </span>
                  </td>
                  <td className="fw-bold text-success">
                    {Number(promotion.amount || 0).toLocaleString()} ETB
                  </td>
                  <td>{promotion.requestDate}</td>
                  <td>
                    <StatusBadge status={promotion.status} />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-info"
                        onClick={() => setSelectedRequest(promotion)}
                      >
                        View Details
                      </button>
                      {promotion.status === "Pending" && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => handleApprove(promotion.id)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleReject(promotion.id)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No promotion requests matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title">Promotion Request - {selectedRequest.listingTitle}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                />
              </div>
              <div className="modal-body text-center">
                <div
                  className="p-4 mb-3 border rounded"
                  style={{
                    backgroundColor: "rgba(227, 30, 36, 0.05)",
                    borderStyle: "dashed",
                    borderColor: "var(--primary-color)",
                  }}
                >
                  {selectedRequest.screenshotUrl ? (
                    <img
                      src={selectedRequest.screenshotUrl}
                      alt="Promotion payment proof"
                      className="img-fluid rounded mb-3"
                      style={{ maxHeight: "220px" }}
                    />
                  ) : (
                    <i className="bi bi-file-earmark-image text-danger" style={{ fontSize: "3rem" }} />
                  )}
                  <p className="mt-2 mb-0 fw-bold">{selectedRequest.screenshotName}</p>
                  <span className="text-muted">Bank Transfer Receipt uploaded by User</span>
                </div>
                <div className="text-muted">
                  User: <strong>{selectedRequest.userName || selectedRequest.ownerName}</strong> | Package:{" "}
                  <strong className="text-danger">{selectedRequest.promotionType}</strong> | Amount:{" "}
                  <strong className="text-success">{selectedRequest.amount} ETB</strong>
                </div>
                <div className="mt-2">
                  Status: <StatusBadge status={selectedRequest.status} />
                </div>
              </div>
              <div className="modal-footer border-0">
                {selectedRequest.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleApprove(selectedRequest.id)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleReject(selectedRequest.id)}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedRequest(null)}
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
