import { useEffect, useState } from "react";
import { adminApi } from "../../services/adminManagementService.js";

function engagementRate(renters, listings) {
  if (!listings) return 0;
  return Math.min(100, Math.round((renters / listings) * 100));
}

export default function AdminAnalyticsPage() {
  const [filter, setFilter] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const params = { range: filter };
    if (filter === "custom") {
      if (!startDate || !endDate) return undefined;
      params.startDate = startDate;
      params.endDate = endDate;
    }

    setIsLoading(true);
    setNotice("");
    adminApi.analytics(params)
      .then((nextData) => {
        if (active) setData(nextData || {});
      })
      .catch((error) => {
        if (active) setNotice(error.response?.data?.message || "Failed to load analytics data.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filter, startDate, endDate]);

  const counts = data?.counts || {};
  const revenue = data?.revenue || {};
  const cityStats = data?.breakdowns?.listingsByCity || [];

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Platform Analytics</h1>
          <p className="text-muted mb-0">
            Analyze platform growth metrics and rental activities.
          </p>
        </div>
      </div>
      {notice && <div className="alert alert-warning">{notice}</div>}

      <div className="admin-table-container mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex gap-2">
            {["today", "week", "month", "year"].map((opt) => (
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

          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">
              <small>Custom:</small>
            </span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setFilter("custom");
              }}
            />
            <span className="text-muted">
              <small>to</small>
            </span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setFilter("custom");
              }}
            />
          </div>
        </div>
      </div>

      <div className="row">
        {[
          ["bi-people", "User Growth", counts.totalUsers || 0, "primary"],
          [
            "bi-box-seam",
            "Listing Growth",
            counts.totalListings || 0,
            "success",
          ],
          [
            "bi-receipt",
            "Listing Fee Revenue",
            `${Number(revenue.listingFeeRevenue || 0).toLocaleString()} ETB`,
            "warning",
          ],
          [
            "bi-cash-stack",
            "Promotion Revenue",
            `${Number(revenue.promotionRevenue || 0).toLocaleString()} ETB`,
            "danger",
          ],
          [
            "bi-shield-check",
            "Verifications",
            counts.verificationRequests || 0,
            "info",
          ],
        ].map(([icon, label, value, tone]) => (
          <div className="col-md-3 mb-4" key={label}>
            <div
              className="admin-stat-card d-flex align-items-center gap-3 p-4 rounded shadow-sm"
              style={{ background: "var(--card-bg)" }}
            >
              <div
                className={`stat-icon-wrapper bg-${tone}-subtle text-${tone} p-3 rounded`}
              >
                <i className={`bi ${icon}`} style={{ fontSize: "1.5rem" }} />
              </div>
              <div>
                <span className="text-muted">
                  <small>{label}</small>
                </span>
                <h2 className="mb-0 fw-bold">{value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-12">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-geo text-primary-custom" /> City Statistics
              Performance
            </h2>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>City</th>
                    <th>New Listings</th>
                    <th>New Rentals</th>
                    <th>Engagement Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {cityStats.map((city) => {
                    const rate = engagementRate(
                      counts.totalRenters || 0,
                      city.value || 0,
                    );
                    return (
                      <tr key={city.label}>
                        <td className="fw-bold">{city.label}</td>
                        <td>{city.value} listings</td>
                        <td>{counts.totalRenters || 0} rentals</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="progress w-100"
                              style={{ height: "6px" }}
                            >
                              <div
                                className="progress-bar bg-danger"
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <small className="fw-bold">{rate}%</small>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {cityStats.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No city statistics for this range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
function Metric({ label, value, icon, tone }) {
  return (
    <div className="col-md-3 mb-4">
      <div
        className="admin-stat-card d-flex align-items-center gap-3 p-4 rounded shadow-sm"
        style={{ background: "var(--card-bg)" }}
      >
        <div
          className={`stat-icon-wrapper bg-${tone}-subtle text-${tone} p-3 rounded`}
        >
          <i className={`bi ${icon}`} style={{ fontSize: "1.5rem" }} />
        </div>
        <div>
          <span className="text-muted">
            <small>{label}</small>
          </span>
          <h2 className="mb-0 fw-bold">{value}</h2>
        </div>
      </div>
    </div>
  );
}
