import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { adminApi } from "../../services/adminManagementService.js";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  async function load() { setReviews(await adminApi.reviews()); }
  useEffect(() => { load().catch(console.error); }, []);
  const handleRemove = async (id) => { if (confirm("Are you sure you want to remove this review permanently?")) { await adminApi.deleteReview(id); await load(); } };
  const filtered = reviews.filter(r => filter === "all" || String(r.status || "approved").toLowerCase() === filter);
  return <main className="dashboard-content"><div className="d-flex justify-content-between align-items-center mb-4"><div><span className="section-label">ADMIN</span><h1 className="h3 mb-0">Reviews & Ratings</h1><p className="text-muted mb-0">Moderate submitted user reviews and resolve flag/report alerts.</p></div></div><div className="admin-table-container"><div className="d-flex gap-2 mb-4">{["all", "approved", "reported"].map(opt => <button key={opt} type="button" className={`btn btn-sm ${filter === opt ? "btn-accent-custom" : "btn-outline-secondary"}`} onClick={() => setFilter(opt)}>{opt.toUpperCase()}</button>)}</div><div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th>Reviewer</th><th>Listing</th><th>Rating</th><th>Comment</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map(r => <tr key={r.id}><td>{r.user?.name || r.user?.email || "-"}</td><td className="fw-bold">{r.listing?.title || "-"}</td><td><div className="text-warning">{Array.from({ length: r.rating }).map((_, i) => <i key={i} className="bi bi-star-fill me-1" />)}{Array.from({ length: 5 - r.rating }).map((_, i) => <i key={i} className="bi bi-star me-1 text-muted" />)}</div></td><td>{r.comment}</td><td><StatusBadge status={r.status || "approved"} /></td><td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(r.id)}>Remove</button></td></tr>)}{filtered.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">No reviews matching criteria.</td></tr>}</tbody></table></div></div></main>;
}
