import { useEffect, useState } from "react";
import { fetchPromotionPayments } from "../../services/paymentService.js";
import { fetchActivePromotions } from "../../services/promotionService.js";
import StatusBadge from "../../components/common/StatusBadge.jsx";

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState("featured");
  const [featuredPayments, setFeaturedPayments] = useState([]);
  const [promotionPayments, setPromotionPayments] = useState([]);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    const active = fetchActivePromotions();
    const payments = fetchPromotionPayments();
    setFeaturedPayments(active.map(p => ({
      listingId: p.listingId,
      title: p.title,
      packageId: p.packageId,
      amount: payments.find(pay => pay.listingId === p.listingId)?.amount || 0,
      date: payments.find(pay => pay.listingId === p.listingId)?.timestamp?.split("T")[0] || "-",
    })));
    setPromotionPayments(payments);
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    setRevenue(total);
  }, []);

  return (
    <div className="admin-payments-page">
      <h2 className="admin-page-title">Payments Management</h2>
      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === "featured" ? "active" : ""}`} onClick={() => setActiveTab("featured")}>Featured Listing Payments</button>
        <button className={`admin-tab ${activeTab === "promotion" ? "active" : ""}`} onClick={() => setActiveTab("promotion")}>Promotion Payments</button>
        <button className={`admin-tab ${activeTab === "revenue" ? "active" : ""}`} onClick={() => setActiveTab("revenue")}>Promotion Revenue</button>
      </div>

      {activeTab === "featured" && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Package</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {featuredPayments.map(p => (
                <tr key={p.listingId}>
                  <td>{p.title}</td>
                  <td>{p.packageId}</td>
                  <td>{p.amount}</td>
                  <td>{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "promotion" && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Package</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {promotionPayments.map(p => (
                <tr key={p.transactionId}>
                  <td>{p.listingId}</td>
                  <td>{p.packageId}</td>
                  <td>{p.amount}</td>
                  <td><StatusBadge status={p.success ? "success" : "failed"} /></td>
                  <td>{p.timestamp?.split("T")[0] || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "revenue" && (
        <div className="admin-revenue-summary">
          <h3>Total Promotion Revenue</h3>
          <p className="revenue-amount">${revenue.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
