import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { adminApi, formatDate } from "../../services/adminManagementService.js";

export default function PromotionHistoryPage() {
  const [promotions, setPromotions] = useState([]);
  useEffect(() => { adminApi.promotions().then(setPromotions).catch(console.error); }, []);
  return <main className="dashboard-content"><div className="d-flex justify-content-between align-items-center mb-4"><div><span className="section-label">ADMIN</span><h1 className="h3 mb-0">Promotion History</h1><p className="text-muted mb-0">Database-backed listing promotion request and payment history.</p></div></div><div className="admin-table-container"><div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th>Listing</th><th>Package</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>{promotions.map((p) => <tr key={p.id}><td>{p.listing?.title || p.listingId}</td><td>{p.packageType}</td><td>{Number(p.amount || 0).toLocaleString()} ETB</td><td><StatusBadge status={p.status} /></td><td>{formatDate(p.createdAt)}</td></tr>)}{!promotions.length && <tr><td colSpan="5" className="text-center text-muted py-4">No promotion history yet.</td></tr>}</tbody></table></div></div></main>;
}
