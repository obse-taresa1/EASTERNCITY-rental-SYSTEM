import { useState, useEffect } from "react";

const getMockData = (filter, startDate, endDate) => {
  let multiplier = 1;
  if (filter === "today") multiplier = 0.1;
  else if (filter === "week") multiplier = 0.5;
  else if (filter === "month") multiplier = 1.0;
  else if (filter === "year") multiplier = 8.0;
  else if (startDate && endDate) {
    const diff = Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    multiplier = Math.max(0.1, Number((diff / 30).toFixed(2)));
  }

  return {
    userGrowth: Math.round(15 * multiplier),
    listingGrowth: Math.round(8 * multiplier),
    listingFeeRevenue: Math.round(4000 * multiplier),
    promoRevenue: Math.round(3500 * multiplier),
    verifications: Math.round(6 * multiplier),
    cityStats: [
      { city: "Jigjiga", listings: Math.round(12 * multiplier), rentals: Math.round(5 * multiplier) },
      { city: "Dire Dawa", listings: Math.round(8 * multiplier), rentals: Math.round(3 * multiplier) },
      { city: "Harar", listings: Math.round(5 * multiplier), rentals: Math.round(2 * multiplier) },
    ]
  };
};

export default function AdminAnalyticsPage() {
  const [filter, setFilter] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(() => getMockData("month"));

  useEffect(() => {
    if (filter === "custom") {
      if (startDate && endDate) {
        setData(getMockData("custom", startDate, endDate));
      }
    } else {
      setData(getMockData(filter));
    }
  }, [filter, startDate, endDate]);

  const handleCustomSearch = (e) => {
    e.preventDefault();
    setFilter("custom");
  };

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Platform Analytics</h1>
          <p className="text-muted mb-0">Analyze platform growth metrics and rental activities.</p>
        </div>
      </div>

      <div className="admin-table-container mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex gap-2">
            {["today", "week", "month", "year"].map(opt => (
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

          <form onSubmit={handleCustomSearch} className="d-flex align-items-center gap-2">
            <span className="text-muted"><small>Custom:</small></span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setFilter("custom");
              }}
              required
            />
            <span className="text-muted"><small>to</small></span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setFilter("custom");
              }}
              required
            />
          </form>
        </div>
      </div>

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="admin-stat-card d-flex align-items-center gap-3 p-4 rounded shadow-sm" style={{ background: "var(--card-bg)" }}>
            <div className="stat-icon-wrapper bg-primary-subtle text-primary p-3 rounded">
              <i className="bi bi-people" style={{ fontSize: "1.5rem" }} />
            </div>
            <div>
              <span className="text-muted"><small>User Growth</small></span>
              <h2 className="mb-0 fw-bold">+{data.userGrowth}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="admin-stat-card d-flex align-items-center gap-3 p-4 rounded shadow-sm" style={{ background: "var(--card-bg)" }}>
            <div className="stat-icon-wrapper bg-success-subtle text-success p-3 rounded">
              <i className="bi bi-box-seam" style={{ fontSize: "1.5rem" }} />
            </div>
            <div>
              <span className="text-muted"><small>Listing Growth</small></span>
              <h2 className="mb-0 fw-bold">+{data.listingGrowth}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="admin-stat-card d-flex align-items-center gap-3 p-4 rounded shadow-sm" style={{ background: "var(--card-bg)" }}>
            <div className="stat-icon-wrapper bg-warning-subtle text-warning p-3 rounded">
              <i className="bi bi-receipt" style={{ fontSize: "1.5rem" }} />
            </div>
            <div>
              <span className="text-muted"><small>Listing Fee Revenue</small></span>
              <h2 className="mb-0 fw-bold">{data.listingFeeRevenue.toLocaleString()} ETB</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="admin-stat-card d-flex align-items-center gap-3 p-4 rounded shadow-sm" style={{ background: "var(--card-bg)" }}>
            <div className="stat-icon-wrapper bg-danger-subtle text-danger p-3 rounded">
              <i className="bi bi-cash-stack" style={{ fontSize: "1.5rem" }} />
            </div>
            <div>
              <span className="text-muted"><small>Promotion Revenue</small></span>
              <h2 className="mb-0 fw-bold">{data.promoRevenue.toLocaleString()} ETB</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-4">
          <div className="admin-stat-card d-flex align-items-center gap-3 p-4 rounded shadow-sm" style={{ background: "var(--card-bg)" }}>
            <div className="stat-icon-wrapper bg-info-subtle text-info p-3 rounded">
              <i className="bi bi-shield-check" style={{ fontSize: "1.5rem" }} />
            </div>
            <div>
              <span className="text-muted"><small>Verifications</small></span>
              <h2 className="mb-0 fw-bold">{data.verifications}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-geo text-primary-custom" /> City Statistics Performance
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
                  {data.cityStats.map(c => (
                    <tr key={c.city}>
                      <td className="fw-bold">{c.city}</td>
                      <td>+{c.listings} listings</td>
                      <td>+{c.rentals} rentals</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress w-100" style={{ height: "6px" }}>
                            <div
                              className="progress-bar bg-danger"
                              style={{ width: `${Math.min(100, Math.round((c.rentals / (c.listings || 1)) * 100))}%` }}
                            />
                          </div>
                          <small className="fw-bold">
                            {Math.min(100, Math.round((c.rentals / (c.listings || 1)) * 100))}%
                          </small>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
