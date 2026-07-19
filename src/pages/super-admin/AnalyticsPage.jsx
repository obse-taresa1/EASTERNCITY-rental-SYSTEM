import { useEffect, useState } from "react";
import { fetchSuperAdminDashboard } from "../../services/dashboardApiService.js";

export default function AnalyticsPage() {
  const [filter, setFilter] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    const params = { range: filter };
    if (filter === "custom") {
      if (!startDate || !endDate) return undefined;
      params.startDate = startDate;
      params.endDate = endDate;
    }

    fetchSuperAdminDashboard(params).then((nextData) => {
      if (active) setData(nextData);
    });

    return () => {
      active = false;
    };
  }, [filter, startDate, endDate]);

  const counts = data?.counts || {};
  const revenue = data?.revenue || {};
  const cityPerformance = data?.breakdowns?.listingsByCity || [];
  const categoryPerformance = data?.breakdowns?.listingsByCategory || [];

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">SUPER ADMIN</span>
          <h1 className="h3 mb-0">Platform Analytics</h1>
          <p className="text-muted mb-0">
            Track platform KPIs, system transactions, and location metrics.
          </p>
        </div>
      </div>

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
              <small>Custom Range:</small>
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

      <div className="row mb-4">
        {[
          [
            "Revenue Growth",
            `${Number((revenue.promotionRevenue || 0) + (revenue.listingFeeRevenue || 0)).toLocaleString()} ETB`,
            "success",
          ],
          ["User Growth", `${counts.totalUsers || 0} Users`, "primary"],
          [
            "Listing Growth",
            `${counts.totalListings || 0} Listings`,
            "warning",
          ],
          [
            "Promotion Growth",
            `${counts.promotionRequests || 0} Promos`,
            "danger",
          ],
        ].map(([label, value, tone]) => (
          <div className="col-md-3" key={label}>
            <div className="p-4 border rounded shadow-sm bg-white text-dark mb-3">
              <span className="text-muted">
                <small>{label}</small>
              </span>
              <h2 className={`mb-0 fw-bold text-${tone}`}>{value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3">City Performance Distribution</h2>
            <ul className="list-group list-group-flush">
              {cityPerformance.map((city) => (
                <li
                  key={city.label}
                  className="list-group-item bg-transparent text-color border-0 py-3"
                >
                  <div className="d-flex justify-content-between mb-1">
                    <span>{city.label}</span>
                    <strong className="text-danger">{city.percent}%</strong>
                  </div>
                  <div className="progress" style={{ height: "6px" }}>
                    <div
                      className="progress-bar bg-danger"
                      style={{ width: `${city.percent}%` }}
                    />
                  </div>
                </li>
              ))}
              {cityPerformance.length === 0 && (
                <li className="list-group-item bg-transparent text-muted border-0 py-3">
                  No city performance data for this range.
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3">Category Performance</h2>
            <ul className="list-group list-group-flush">
              {categoryPerformance.map((category) => (
                <li
                  key={category.label}
                  className="list-group-item bg-transparent text-color d-flex justify-content-between"
                >
                  <span>{category.label}</span>
                  <strong className="text-danger">
                    {category.value} New Listings
                  </strong>
                </li>
              ))}
              {categoryPerformance.length === 0 && (
                <li className="list-group-item bg-transparent text-muted">
                  No category performance data for this range.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
function Card({ label, value, tone }) {
  return (
    <div className="col-md-3">
      <div className="p-4 border rounded shadow-sm bg-white text-dark mb-3">
        <span className="text-muted">
          <small>{label}</small>
        </span>
        <h2 className={`mb-0 fw-bold text-${tone}`}>{value}</h2>
      </div>
    </div>
  );
}
