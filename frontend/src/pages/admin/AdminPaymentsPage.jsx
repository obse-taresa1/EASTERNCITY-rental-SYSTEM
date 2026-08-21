import { useEffect, useMemo, useState } from "react";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { adminApi, formatDate } from "../../services/adminManagementService.js";

const tabs = [
  { id: "featured", label: "Featured listing payments", icon: "bi-star" },
  { id: "promotion", label: "Promotion payments", icon: "bi-megaphone" },
  { id: "revenue", label: "Promotion revenue", icon: "bi-graph-up-arrow" },
];

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

  const approved = useMemo(
    () => promotions.filter((payment) => ["APPROVED", "ACTIVE"].includes(String(payment.status).toUpperCase())),
    [promotions],
  );
  const revenue = useMemo(
    () => promotions.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    [promotions],
  );

  return (
    <div className="admin-payments-page">
      <header className="payments-page-header">
        <div>
          <span className="admin-page-kicker">Financial overview</span>
          <h2 className="admin-page-title">Payments Management</h2>
          <p>Review featured-listing payments, promotion activity, and revenue in one place.</p>
        </div>
        <div className="payments-header-icon" aria-hidden="true"><i className="bi bi-wallet2" /></div>
      </header>

      <nav className="payments-tabs" aria-label="Payment views">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            className={`payments-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`bi ${tab.icon}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {notice && <div className="alert alert-warning">{notice}</div>}
      {activeTab === "featured" && <PaymentTable rows={approved} simple isLoading={isLoading} />}
      {activeTab === "promotion" && <PaymentTable rows={promotions} isLoading={isLoading} />}
      {activeTab === "revenue" && <RevenueSummary revenue={revenue} count={approved.length} isLoading={isLoading} />}
    </div>
  );
}

function PaymentTable({ rows, simple, isLoading }) {
  if (isLoading) {
    return <div className="payments-table-card payments-loading"><span className="spinner-border spinner-border-sm" /> Loading payment records…</div>;
  }

  return (
    <div className="payments-table-card">
      <div className="payments-table-heading">
        <div>
          <h3>{simple ? "Featured listing payments" : "Promotion payments"}</h3>
          <p>{rows.length} {rows.length === 1 ? "record" : "records"} available</p>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="payments-empty-state">
          <span><i className="bi bi-receipt" /></span>
          <h4>No payment records yet</h4>
          <p>{simple ? "Approved featured-listing payments will appear here." : "Promotion payment records will appear here when they are created."}</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="payments-table">
            <thead><tr><th>Listing</th><th>Package</th><th>Amount</th>{!simple && <th>Status</th>}<th>Date</th></tr></thead>
            <tbody>{rows.map((payment) => (
              <tr key={payment.id}>
                <td><strong>{payment.listing?.title || payment.listingId}</strong></td>
                <td>{payment.packageType || "—"}</td>
                <td><strong className="payment-amount">ETB {Number(payment.amount || 0).toLocaleString()}</strong></td>
                {!simple && <td><StatusBadge status={payment.status} /></td>}
                <td>{formatDate(payment.createdAt)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RevenueSummary({ revenue, count, isLoading }) {
  if (isLoading) return <div className="payments-table-card payments-loading"><span className="spinner-border spinner-border-sm" /> Calculating revenue…</div>;
  return (
    <section className="payments-revenue-grid">
      <article className="revenue-primary-card">
        <span className="revenue-icon"><i className="bi bi-cash-stack" /></span>
        <p>Total promotion revenue</p>
        <h3>ETB {revenue.toLocaleString()}</h3>
        <small>From {count} approved {count === 1 ? "promotion" : "promotions"}</small>
      </article>
      <article className="revenue-detail-card">
        <i className="bi bi-shield-check" />
        <div><strong>Payment records</strong><span>Only approved and active promotions are included in this total.</span></div>
      </article>
    </section>
  );
}
