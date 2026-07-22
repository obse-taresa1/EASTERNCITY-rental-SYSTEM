import { useEffect, useState } from "react";
import { adminApi } from "../../services/adminManagementService.js";

export default function PlatformOverviewPage() {
  const [dashboard, setDashboard] = useState(null);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    adminApi.analytics({ range: "month" })
      .then((data) => {
        if (active) setDashboard(data || {});
      })
      .catch((error) => {
        if (active) setNotice(error.response?.data?.message || "Failed to load platform overview.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const counts = dashboard?.counts || {};
  const revenue = dashboard?.revenue || {};
  const chartValues = dashboard?.chart?.values || [];
  const maxChartValue = Math.max(...chartValues, 1);

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">SUPER ADMIN</span>
          <h1 className="h3 mb-0">Platform Overview</h1>
          <p className="text-muted mb-0">
            Monitor live platform traffic, engagement, and infrastructure
            metrics.
          </p>
        </div>
      </div>
      {notice && <div className="alert alert-warning">{notice}</div>}

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-globe text-primary-custom" /> Platform Traffic
              Statistics
            </h2>
            <div className="row text-center mt-3">
              {[
                ["Total Users", counts.totalUsers || 0],
                ["Total Listings", counts.totalListings || 0],
                ["Total Promotions", counts.promotionRequests || 0],
                ["Notifications", counts.notifications || 0],
              ].map(([label, value]) => (
                <div className="col-6 mb-3" key={label}>
                  <div className="p-3 border rounded">
                    <span className="text-muted d-block mb-1">
                      <small>{label}</small>
                    </span>
                    <strong className="h4 text-color">{value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-people text-primary-custom" /> User Statistics
              & Metrics
            </h2>
            <ul className="list-group list-group-flush mt-2">
              <li className="list-group-item bg-transparent text-color d-flex justify-content-between">
                <span>Monthly New Signups</span>
                <strong className="text-success">
                  {counts.totalUsers || 0}
                </strong>
              </li>
              <li className="list-group-item bg-transparent text-color d-flex justify-content-between">
                <span>Active Renters</span>
                <strong className="text-color">
                  {counts.totalRenters || 0}
                </strong>
              </li>
              <li className="list-group-item bg-transparent text-color d-flex justify-content-between">
                <span>Active Owners</span>
                <strong className="text-color">
                  {counts.totalOwners || 0}
                </strong>
              </li>
              <li className="list-group-item bg-transparent text-color d-flex justify-content-between">
                <span>Verified Requests</span>
                <strong className="text-danger">
                  {counts.approvedVerifications || 0}
                </strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-graph-up-arrow text-primary-custom" />{" "}
              Platform Growth Chart
            </h2>
            <div className="p-4 bg-light text-dark rounded text-center">
              <div
                className="d-flex align-items-end justify-content-center gap-3"
                style={{ height: "150px" }}
              >
                {chartValues.slice(-4).map((value, index) => (
                  <div
                    className="bg-danger rounded"
                    style={{
                      height: `${Math.max(10, Math.round(((Number(value) || 0) / maxChartValue) * 100))}%`,
                      width: "30px",
                    }}
                    title={`Period ${index + 1}`}
                    key={`${value}-${index}`}
                  />
                ))}
              </div>
              <p className="mt-3 mb-0 text-muted">
                <small>Growth is calculated from live platform records.</small>
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-cash-stack text-primary-custom" /> Promotion
              Revenue
            </h2>
            <div className="p-4 bg-light text-dark rounded text-center">
              <strong className="h2 text-success">
                {Number(revenue.promotionRevenue || 0).toLocaleString()} ETB
              </strong>
              <p className="mt-3 mb-0 text-muted">
                <small>
                  Promotion revenue comes from approved promotion records.
                </small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
function Stat({ label, value, danger }) {
  return (
    <div className="col-6 mb-3">
      <div className="p-3 border rounded">
        <span className="text-muted d-block mb-1">
          <small>{label}</small>
        </span>
        <strong className={`h4 ${danger ? "text-danger" : "text-color"}`}>
          {value}
        </strong>
      </div>
    </div>
  );
}
