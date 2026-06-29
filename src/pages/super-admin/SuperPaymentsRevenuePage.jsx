import { useState } from "react";

const initialTransactions = [
  { id: "TX-9081", itemTitle: "Toyota RAV4", owner: "Abebe Rental", package: "VIP Featured", amount: 2000, date: "2026-06-24", status: "completed" },
  { id: "TX-9082", itemTitle: "Gaming PC", owner: "Tech Hub Rentals", package: "Premium Featured", amount: 1000, date: "2026-06-25", status: "completed" },
  { id: "TX-9083", itemTitle: "Dewalt Drill Kit", owner: "BuildRight Tools", package: "Basic Featured", amount: 500, date: "2026-06-23", status: "completed" },
  { id: "TX-9084", itemTitle: "Canon Camera", owner: "Lens House", package: "VIP Featured", amount: 2000, date: "2026-06-22", status: "completed" },
  { id: "TX-9085", itemTitle: "Sport Bike", owner: "Abebe Rental", package: "Premium Featured", amount: 1000, date: "2026-06-20", status: "completed" },
];

export default function SuperPaymentsRevenuePage() {
  const [txs] = useState(initialTransactions);
  const [filter, setFilter] = useState("all");

  const totalRevenue = txs.reduce((sum, t) => sum + t.amount, 0);
  const vipRevenue = txs.filter(t => t.package === "VIP Featured").reduce((sum, t) => sum + t.amount, 0);
  const premiumRevenue = txs.filter(t => t.package === "Premium Featured").reduce((sum, t) => sum + t.amount, 0);
  const basicRevenue = txs.filter(t => t.package === "Basic Featured").reduce((sum, t) => sum + t.amount, 0);

  const filtered = txs.filter(t => {
    if (filter === "all") return true;
    return t.package.toLowerCase().includes(filter.toLowerCase());
  });

  const handleExport = () => {
    alert("Revenue reports exported to PDF/CSV successfully!");
  };

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">SUPER ADMIN</span>
          <h1 className="h3 mb-0">Payments & Promotion Revenue</h1>
          <p className="text-muted mb-0">
            Track advertiser promotion fees. Rental payments are not collected on-platform.
          </p>
        </div>
        <button type="button" className="btn btn-accent-custom" onClick={handleExport}>
          <i className="bi bi-file-earmark-arrow-down me-1" /> Export Reports
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="p-4 border rounded shadow-sm bg-danger text-white">
            <span className="opacity-75"><small>Total Platform Revenue</small></span>
            <h2 className="mb-0 fw-bold">{totalRevenue.toLocaleString()} ETB</h2>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="p-4 border rounded shadow-sm" style={{ background: "var(--card-bg)" }}>
            <span className="text-muted"><small>VIP Featured Revenue</small></span>
            <h2 className="mb-0 fw-bold text-danger">{vipRevenue.toLocaleString()} ETB</h2>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="p-4 border rounded shadow-sm" style={{ background: "var(--card-bg)" }}>
            <span className="text-muted"><small>Premium Revenue</small></span>
            <h2 className="mb-0 fw-bold text-danger">{premiumRevenue.toLocaleString()} ETB</h2>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="p-4 border rounded shadow-sm" style={{ background: "var(--card-bg)" }}>
            <span className="text-muted"><small>Basic Featured Revenue</small></span>
            <h2 className="mb-0 fw-bold text-danger">{basicRevenue.toLocaleString()} ETB</h2>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h5 mb-0">Monthly Revenue Transactions</h2>
          <div className="d-flex gap-2">
            {["all", "VIP", "Premium", "Basic"].map(opt => (
              <button
                key={opt}
                type="button"
                className={`btn btn-sm ${filter === opt ? "btn-accent-custom" : "btn-outline-secondary"}`}
                onClick={() => setFilter(opt)}
              >
                {opt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Listing Item</th>
                <th>Owner</th>
                <th>Package</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="fw-bold">{t.id}</td>
                  <td>{t.itemTitle}</td>
                  <td>{t.owner}</td>
                  <td>
                    <span className="badge bg-danger-subtle text-danger">{t.package}</span>
                  </td>
                  <td>{t.date}</td>
                  <td className="fw-bold text-success">+{t.amount.toLocaleString()} ETB</td>
                  <td>
                    <span className="badge bg-success-subtle text-success">Success</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
