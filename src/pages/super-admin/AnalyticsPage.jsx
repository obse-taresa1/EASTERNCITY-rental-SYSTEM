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
    revenueGrowth: Math.round(15400 * multiplier),
    userGrowth: Math.round(340 * multiplier),
    listingGrowth: Math.round(200 * multiplier),
    promotionGrowth: Math.round(8 * multiplier),
    cityPerformance: [
      { name: "Jigjiga", rate: "48%" },
      { name: "Dire Dawa", rate: "35%" },
      { name: "Harar", rate: "17%" },
    ],
    categoryPerformance: [
      { name: "Vehicles", count: Math.round(24 * multiplier) },
      { name: "Electronics & Cameras", count: Math.round(42 * multiplier) },
      { name: "Construction Tools", count: Math.round(19 * multiplier) },
    ]
  };
};

export default function AnalyticsPage() {
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

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">SUPER ADMIN</span>
          <h1 className="h3 mb-0">Platform Analytics</h1>
          <p className="text-muted mb-0">Track platform KPIs, system transactions, and location metrics.</p>
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

          <div className="d-flex align-items-center gap-2">
            <span className="text-muted"><small>Custom Range:</small></span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setFilter("custom");
              }}
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
            />
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-3">
          <div className="p-4 border rounded shadow-sm bg-white text-dark mb-3">
            <span className="text-muted"><small>Revenue Growth</small></span>
            <h2 className="mb-0 fw-bold text-success">+{data.revenueGrowth.toLocaleString()} ETB</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-4 border rounded shadow-sm bg-white text-dark mb-3">
            <span className="text-muted"><small>User Growth</small></span>
            <h2 className="mb-0 fw-bold text-primary">+{data.userGrowth} Users</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-4 border rounded shadow-sm bg-white text-dark mb-3">
            <span className="text-muted"><small>Listing Growth</small></span>
            <h2 className="mb-0 fw-bold text-warning">+{data.listingGrowth} Listings</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-4 border rounded shadow-sm bg-white text-dark mb-3">
            <span className="text-muted"><small>Promotion Growth</small></span>
            <h2 className="mb-0 fw-bold text-danger">+{data.promotionGrowth} Promos</h2>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3">City Performance Distribution</h2>
            <ul className="list-group list-group-flush">
              {data.cityPerformance.map(city => (
                <li key={city.name} className="list-group-item bg-transparent text-color border-0 py-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>{city.name}</span>
                    <strong className="text-danger">{city.rate}</strong>
                  </div>
                  <div className="progress" style={{ height: "6px" }}>
                    <div className="progress-bar bg-danger" style={{ width: city.rate }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3">Category Performance</h2>
            <ul className="list-group list-group-flush">
              {data.categoryPerformance.map(cat => (
                <li key={cat.name} className="list-group-item bg-transparent text-color d-flex justify-content-between">
                  <span>{cat.name}</span>
                  <strong className="text-danger">{cat.count} New Listings</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
