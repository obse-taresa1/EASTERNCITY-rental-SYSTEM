import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { adminApi, formatDate } from "../../services/adminManagementService.js";
import { resolveAssetUrl } from "../../services/apiClient.js";

const filters = ["all", "PENDING", "APPROVED", "REJECTED"];
export default function SuperPromotionManagementPage({ scope = "superadmin" }) {
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const sectionLabel = scope === "admin" ? "ADMIN" : "SUPER ADMIN";

  const load = async () => {
    setLoading(true);
    setNotice("");
    try {
      const data = await adminApi.promotions({ status: filter === "all" ? "" : filter });
      setPromotions(data || []);
    } catch (error) {
      setNotice(error.response?.data?.message || "Failed to load promotions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      await adminApi.updatePromotion(id, { status: "APPROVED" });
      setNotice("Promotion approved successfully.");
      await load();
    } catch (error) {
      setNotice(error.response?.data?.message || "Failed to approve promotion.");
      setLoading(false);
    }
  };

  const handleReject = async (id) => {
    setLoading(true);
    try {
      await adminApi.updatePromotion(id, { status: "REJECTED" });
      setNotice("Promotion rejected.");
      await load();
    } catch (error) {
      setNotice(error.response?.data?.message || "Failed to reject promotion.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await adminApi.deletePromotion(id);
      setNotice("Promotion deleted successfully.");
      await load();
    } catch (error) {
      setNotice(error.response?.data?.message || "Failed to delete promotion.");
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  const filtered = promotions.filter(p => {
    const matchesSearch = (p.listing?.title || "").toLowerCase().includes(search.toLowerCase()) || (p.user?.name || p.user?.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesPackage = packageFilter === "all" || p.placement === packageFilter || p.packageType === packageFilter;
    return matchesSearch && matchesPackage;
  });
  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">{sectionLabel}</span>
          <h1 className="h3 mb-0">Promotion Management</h1>
          <p className="text-muted mb-0">Review and approve featured listing packages and payment proofs.</p>
        </div>
      </div>
      {notice && <div className="alert alert-warning">{notice}</div>}
      <div className="admin-table-container">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
          <div className="d-flex flex-column gap-2">
            <div className="d-flex gap-2">
              <span className="text-muted small align-self-center me-2" style={{ width: "60px" }}>Status:</span>
              {filters.map(status => <button key={status} type="button" className={`btn btn-sm ${filter === status ? "btn-accent-custom" : "btn-outline-secondary"}`} onClick={() => setFilter(status)}>{status.toUpperCase()}</button>)}
            </div>
            <div className="d-flex gap-2">
              <span className="text-muted small align-self-center me-2" style={{ width: "60px" }}>Type:</span>
              <button type="button" className={`btn btn-sm ${packageFilter === "all" ? "btn-accent-custom" : "btn-outline-secondary"}`} onClick={() => setPackageFilter("all")}>ALL TYPES</button>
              <button type="button" className={`btn btn-sm ${packageFilter === "FEATURED" ? "btn-accent-custom" : "btn-outline-secondary"}`} onClick={() => setPackageFilter("FEATURED")}>FEATURED</button>
              <button type="button" className={`btn btn-sm ${packageFilter === "HERO_PROMOTION" ? "btn-accent-custom" : "btn-outline-secondary"}`} onClick={() => setPackageFilter("HERO_PROMOTION")}>HERO SECTION</button>
            </div>
          </div>
          <div className="search-box align-self-start" style={{ maxWidth: "300px", width: "100%" }}>
            <input type="text" placeholder="Search listing or user..." className="form-control" value={search} onChange={e => setSearch(e.target.value)} />
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
            <tbody>{filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="fw-bold">{p.listing?.title || "-"}</div>
                  <small className="text-muted">{p.listingId}</small>
                </td>
                <td>{p.user?.name || p.user?.email || "-"}</td>
                <td><span className="badge bg-danger-subtle text-danger">{p.packageType}</span></td>
                <td className="fw-bold text-success">{Number(p.amount || 0).toLocaleString()} ETB</td>
                <td>{formatDate(p.createdAt)}</td>
                <td><StatusBadge status={p.status} /></td>
                <td>
                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-sm btn-outline-info" onClick={() => setSelectedRequest(p)}>View Details</button>
                    {String(p.status).toUpperCase() === "PENDING" && <>
                      <button type="button" className="btn btn-sm btn-success" onClick={() => handleApprove(p.id)}>Approve</button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleReject(p.id)}>Reject</button>
                    </>}
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(p)}>
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="7" className="text-center text-muted py-4">No promotion requests matching criteria.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title">Promotion Request - {selectedRequest.listing?.title}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedRequest(null)} />
              </div>
              <div className="modal-body text-center">
                <div className="p-4 mb-3 border rounded" style={{ backgroundColor: "rgba(227, 30, 36, 0.05)", borderStyle: "dashed", borderColor: "var(--primary-color)" }}>
                  {selectedRequest.paymentProofUrl ? (
                    <img
                      src={resolveAssetUrl(selectedRequest.paymentProofUrl)}
                      alt="Promotion payment proof"
                      className="img-fluid rounded mb-2"
                      style={{ maxHeight: "220px", objectFit: "contain", display: "block", margin: "0 auto" }}
                      onError={(e) => {
                        // Legacy records stored /uploads/filename.png; actual file is at /uploads/payments/filename.png
                        const src = e.target.src;
                        if (!src.includes("/payments/")) {
                          const fixed = src.replace("/uploads/", "/uploads/payments/");
                          e.target.src = fixed;
                        } else {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}
                  {selectedRequest.paymentProofUrl ? (
                    <div style={{ display: "none" }} className="text-center py-3 flex-column align-items-center justify-content-center">
                      <i className="bi bi-file-earmark-image text-danger" style={{ fontSize: "3rem" }} />
                      <p className="text-muted mt-1 small mb-0">Image could not be loaded.</p>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <i className="bi bi-file-earmark-image text-danger" style={{ fontSize: "3rem" }} />
                      <p className="text-muted mt-1 small mb-0">No payment proof uploaded.</p>
                    </div>
                  )}
                  <p className="mt-2 mb-0 fw-bold">Payment proof</p>
                  <span className="text-muted">Bank Transfer Receipt uploaded by User</span>
                </div>
                <div className="text-muted">User: <strong>{selectedRequest.user?.name || selectedRequest.user?.email}</strong> | Package: <strong className="text-danger">{selectedRequest.packageType}</strong> | Amount: <strong className="text-success">{selectedRequest.amount} ETB</strong></div>
                <div className="mt-2">Status: <StatusBadge status={selectedRequest.status} /></div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedRequest(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ background: "var(--card-bg)" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title">Confirm Delete Promotion</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteTarget(null)} />
              </div>
              <div className="modal-body text-center">
                <p>Are you sure you want to delete the promotion for <strong>{deleteTarget.listing?.title || deleteTarget.listingId}</strong>?</p>
                <p className="text-danger"><i className="bi bi-exclamation-triangle-fill"></i> This action cannot be undone.</p>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(deleteTarget.id)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
