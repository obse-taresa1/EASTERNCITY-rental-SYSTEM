import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/adminManagementService.js";

function packageMatches(promotion, filter) {
  if (filter === "all") return true;
  const value =
    `${promotion.package || ""} ${promotion.promotionType || ""} ${promotion.promotionPlacement || ""}`.toLowerCase();
  return value.includes(filter.toLowerCase());
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString();
}

export default function SuperPaymentsRevenuePage() {
  const [txs, setTxs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchPromotions = async () => {
    setIsLoading(true);
    setNotice("");
    try {
      const promotions = await adminApi.promotions();
      setTxs(
        promotions
          .filter(
            (promotion) =>
              String(promotion.status || "").toLowerCase() === "approved",
          )
          .map((promotion) => ({
            id: promotion.id,
            itemTitle: promotion.listingTitle || promotion.listing?.title,
            owner: promotion.ownerName || promotion.userName || promotion.user?.name,
            package:
              promotion.promotionType ||
              promotion.promotionPlacement ||
              promotion.packageType ||
              "Promotion",
            amount: Number(promotion.amount || 0),
            date: promotion.requestDate || promotion.createdAt,
            status: promotion.status,
          })),
      );
    } catch (error) {
      setNotice(error.response?.data?.message || "Failed to load revenue data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const totalRevenue = txs.reduce((sum, t) => sum + t.amount, 0);
  const homepageBannerRevenue = txs
    .filter((t) => String(t.package).toLowerCase().includes("banner"))
    .reduce((sum, t) => sum + t.amount, 0);
  const topListingRevenue = txs
    .filter((t) => String(t.package).toLowerCase().includes("top"))
    .reduce((sum, t) => sum + t.amount, 0);
  const featuredListingRevenue = txs
    .filter((t) => String(t.package).toLowerCase().includes("featured"))
    .reduce((sum, t) => sum + t.amount, 0);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return txs.filter((t) => {
      if (!packageMatches(t, filter)) return false;
      if (!term) return true;
      return [t.id, t.itemTitle, t.owner, t.package, t.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [txs, filter, search]);

  const handleExport = () => {
    const rows = filtered.map((transaction) =>
      [
        transaction.id,
        transaction.itemTitle,
        transaction.owner,
        transaction.package,
        formatDate(transaction.date),
        transaction.amount,
        transaction.status,
      ].join(","),
    );
    const csv = [
      "Transaction ID,Listing Item,Owner,Package,Date,Amount,Status",
      ...rows,
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "promotion-revenue.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">SUPER ADMIN</span>
          <h1 className="h3 mb-0">Payments & Promotion Revenue</h1>
          <p className="text-muted mb-0">
            Track advertiser promotion fees. Rental payments are not collected
            on-platform.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-accent-custom"
          onClick={handleExport}
        >
          <i className="bi bi-file-earmark-arrow-down me-1" /> Export Reports
        </button>
      </div>
      {notice && <div className="alert alert-warning">{notice}</div>}

      <div className="row mb-4">
        {[
          ["Total Platform Revenue", totalRevenue, "bg-danger text-white"],
          ["Homepage Banner Revenue", homepageBannerRevenue, ""],
          ["Top Listing Revenue", topListingRevenue, ""],
          ["Featured Listing Revenue", featuredListingRevenue, ""],
        ].map(([label, value, tone]) => (
          <div className="col-md-3 mb-3" key={label}>
            <div
              className={`p-4 border rounded shadow-sm ${tone}`}
              style={tone ? undefined : { background: "var(--card-bg)" }}
            >
              <span className={tone ? "opacity-75" : "text-muted"}>
                <small>{label}</small>
              </span>
              <h2 className={`mb-0 fw-bold ${tone ? "" : "text-danger"}`}>
                {Number(value || 0).toLocaleString()} ETB
              </h2>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-table-container">
        <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
          <h2 className="h5 mb-0">Monthly Revenue Transactions</h2>
          <input
            className="form-control form-control-sm"
            style={{ maxWidth: "260px" }}
            placeholder="Search transactions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="d-flex gap-2">
            {["all", "Homepage", "Top", "Featured"].map((opt) => (
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
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td className="fw-bold">{t.id}</td>
                  <td>{t.itemTitle}</td>
                  <td>{t.owner}</td>
                  <td>
                    <span className="badge bg-danger-subtle text-danger">
                      {t.package}
                    </span>
                  </td>
                  <td>{formatDate(t.date)}</td>
                  <td className="fw-bold text-success">
                    +{t.amount.toLocaleString()} ETB
                  </td>
                  <td>
                    <span className="badge bg-success-subtle text-success">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No approved promotion payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
function Rev({ label, value, primary }) {
  return (
    <div className="col-md-3 mb-3">
      <div
        className={`p-4 border rounded shadow-sm ${primary ? "bg-danger text-white" : ""}`}
        style={primary ? undefined : { background: "var(--card-bg)" }}
      >
        <span className={primary ? "opacity-75" : "text-muted"}>
          <small>{label}</small>
        </span>
        <h2 className={`mb-0 fw-bold ${primary ? "" : "text-danger"}`}>
          {Number(value || 0).toLocaleString()} ETB
        </h2>
      </div>
    </div>
  );
}
