import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { adminApi, formatDate } from "../../services/adminManagementService.js";

export default function AdminRentersPage() {
  const [renters, setRenters] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewingHistory, setViewingHistory] = useState(null);

  async function loadRenters() {
    const users = await adminApi.users({ search });
    setRenters(users.filter((u) => Number(u._count?.rentedBookings || 0) > 0 || String(u.role).toUpperCase() === "USER"));
  }
  useEffect(() => { loadRenters().catch(console.error); }, [search]);

  const handleToggleStatus = async (r) => { await adminApi.updateUser(r.id, { status: String(r.status).toUpperCase() === "SUSPENDED" ? "ACTIVE" : "SUSPENDED" }); await loadRenters(); };
  const filtered = renters.filter(r => filter === "all" || String(r.status || "ACTIVE").toLowerCase() === filter);

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4"><div><span className="section-label">ADMIN</span><h1 className="h3 mb-0">Renters Management</h1><p className="text-muted mb-0">Monitor platform renters activity, review scores, and bookings.</p></div></div>
      <div className="admin-table-container"><div className="d-flex flex-wrap justify-content-between gap-3 mb-4"><div className="d-flex gap-2">{["all", "active", "suspended"].map(opt => <button key={opt} type="button" className={`btn btn-sm ${filter === opt ? "btn-accent-custom" : "btn-outline-secondary"}`} onClick={() => setFilter(opt)}>{opt.toUpperCase()}</button>)}</div><div className="search-box" style={{ maxWidth: "300px", width: "100%" }}><input type="text" placeholder="Search by renter name, city..." className="form-control" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
        <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th>Renter Name</th><th>City</th><th>Registration Date</th><th>Reviews Given</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map(r => { const status = String(r.status || "ACTIVE").toLowerCase(); return <tr key={r.id}><td className="fw-bold">{r.name}</td><td>{r.city || "-"}</td><td>{formatDate(r.createdAt)}</td><td>{r._count?.reviews || 0} Reviews</td><td><StatusBadge status={status} /></td><td><div className="d-flex gap-2"><button type="button" className={`btn btn-sm ${status === "active" ? "btn-warning text-white" : "btn-primary"}`} onClick={() => handleToggleStatus(r)}>{status === "active" ? "Suspend" : "Activate"}</button><button type="button" className="btn btn-sm btn-outline-info" onClick={() => setViewingHistory(r)}>Rental History</button></div></td></tr>; })}{filtered.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">No renters found matching criteria.</td></tr>}</tbody></table></div>
      </div>
      {viewingHistory && <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content" style={{ background: "var(--card-bg)" }}><div className="modal-header border-0"><h5 className="modal-title">Rental History for {viewingHistory.name}</h5><button type="button" className="btn-close" onClick={() => setViewingHistory(null)} /></div><div className="modal-body"><p className="text-muted">Past rental activity records:</p><div className="list-group list-group-flush"><div className="list-group-item bg-transparent text-color border-0 py-2"><strong>{viewingHistory._count?.rentedBookings || 0}</strong> bookings in database</div></div></div><div className="modal-footer border-0"><button type="button" className="btn btn-secondary" onClick={() => setViewingHistory(null)}>Close</button></div></div></div></div>}
    </main>
  );
}
