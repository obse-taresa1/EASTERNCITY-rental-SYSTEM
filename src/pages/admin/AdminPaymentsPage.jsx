import { useEffect, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { adminApi, formatDate } from "../../services/adminManagementService.js";

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState("featured");
  const [promotions, setPromotions] = useState([]);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setNotice("");
    adminApi.promotions()
      .then((data) => setPromotions(data || []))
      .catch((err) => setNotice(err.message || "Failed to load payments."))
      .finally(() => setIsLoading(false));
  }, []);
  const approved = promotions.filter((p) => ["APPROVED", "ACTIVE"].includes(String(p.status).toUpperCase()));
  const revenue = promotions.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  return <div className="admin-payments-page"><h2 className="admin-page-title">Payments Management</h2><div className="admin-tabs"><button className={`admin-tab ${activeTab === "featured" ? "active" : ""}`} onClick={() => setActiveTab("featured")}>Featured Listing Payments</button><button className={`admin-tab ${activeTab === "promotion" ? "active" : ""}`} onClick={() => setActiveTab("promotion")}>Promotion Payments</button><button className={`admin-tab ${activeTab === "revenue" ? "active" : ""}`} onClick={() => setActiveTab("revenue")}>Promotion Revenue</button></div>
    {notice && <div className="alert alert-warning">{notice}</div>}
    {activeTab === "featured" && <PaymentTable rows={approved} simple />}{activeTab === "promotion" && <PaymentTable rows={promotions} />}{activeTab === "revenue" && <div className="admin-revenue-summary"><h3>Total Promotion Revenue</h3><p className="revenue-amount">{revenue.toFixed(2)} ETB</p></div>}</div>;
}
function PaymentTable({ rows, simple }) { return <div className="admin-table-container"><table className="admin-table"><thead><tr><th>Listing</th><th>Package</th><th>Amount</th>{!simple && <th>Status</th>}<th>Date</th></tr></thead><tbody>{rows.map(p => <tr key={p.id}><td>{p.listing?.title || p.listingId}</td><td>{p.packageType}</td><td>{Number(p.amount || 0).toLocaleString()} ETB</td>{!simple && <td><StatusBadge status={p.status} /></td>}<td>{formatDate(p.createdAt)}</td></tr>)}</tbody></table></div>; }
