import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { adminApi } from "../../services/adminManagementService.js";

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewingListings, setViewingListings] = useState(null);

  async function loadOwners() {
    const users = await adminApi.users({ search });
    const ownerRows = users.filter((u) => Number(u._count?.listings || 0) > 0 || String(u.role).toUpperCase() === "OWNER");
    setOwners(ownerRows);
  }

  useEffect(() => { loadOwners().catch(console.error); }, [search]);

  const handleVerify = async (id) => { await adminApi.updateUser(id, { verificationStatus: "APPROVED" }); await loadOwners(); };
  const handleToggleStatus = async (owner) => { await adminApi.updateUser(owner.id, { status: String(owner.status).toUpperCase() === "SUSPENDED" ? "ACTIVE" : "SUSPENDED" }); await loadOwners(); };

  const filtered = owners.filter(o => {
    const verified = ["APPROVED", "VERIFIED"].includes(String(o.verificationStatus).toUpperCase());
    const suspended = String(o.status).toUpperCase() === "SUSPENDED";
    return filter === "all" || (filter === "verified" && verified) || (filter === "unverified" && !verified) || (filter === "suspended" && suspended);
  });

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4"><div><span className="section-label">ADMIN</span><h1 className="h3 mb-0">Owners Management</h1><p className="text-muted mb-0">Verify and monitor property and asset rental owners.</p></div></div>
      <div className="admin-table-container">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-4"><div className="d-flex gap-2">{["all", "verified", "unverified", "suspended"].map(opt => <button key={opt} type="button" className={`btn btn-sm ${filter === opt ? "btn-accent-custom" : "btn-outline-secondary"}`} onClick={() => setFilter(opt)}>{opt.toUpperCase()}</button>)}</div><div className="search-box" style={{ maxWidth: "300px", width: "100%" }}><input type="text" placeholder="Search by owner name, city..." className="form-control" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th>Owner Name</th><th>Verification Status</th><th>Total Listings</th><th>City</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {filtered.map(o => {
            const verified = ["APPROVED", "VERIFIED"].includes(String(o.verificationStatus).toUpperCase());
            const status = String(o.status || "ACTIVE").toLowerCase();
            return <tr key={o.id}><td className="fw-bold">{o.name}</td><td>{verified ? <span className="badge bg-success-subtle text-success"><i className="bi bi-patch-check-fill me-1" /> Verified</span> : <span className="badge bg-warning-subtle text-warning">Pending Verification</span>}</td><td>{o._count?.listings || 0} Listings</td><td>{o.city || "-"}</td><td><StatusBadge status={status} /></td><td><div className="d-flex gap-2">{!verified && <button type="button" className="btn btn-sm btn-success" onClick={() => handleVerify(o.id)}>Verify</button>}<button type="button" className={`btn btn-sm ${status === "active" ? "btn-warning text-white" : "btn-primary"}`} onClick={() => handleToggleStatus(o)}>{status === "active" ? "Suspend" : "Activate"}</button><button type="button" className="btn btn-sm btn-outline-info" onClick={() => setViewingListings(o)}>Listings</button></div></td></tr>;
          })}
          {filtered.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">No owners found matching criteria.</td></tr>}
        </tbody></table></div>
      </div>
      {viewingListings && <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content" style={{ background: "var(--card-bg)" }}><div className="modal-header border-0"><h5 className="modal-title">Listings for {viewingListings.name}</h5><button type="button" className="btn-close" onClick={() => setViewingListings(null)} /></div><div className="modal-body"><p className="text-muted">Currently active listings published by this owner:</p><ul className="list-group list-group-flush"><li className="list-group-item bg-transparent text-color">{viewingListings._count?.listings || 0} listings in database</li></ul></div><div className="modal-footer border-0"><button type="button" className="btn btn-secondary" onClick={() => setViewingListings(null)}>Close</button></div></div></div></div>}
    </main>
  );
}
