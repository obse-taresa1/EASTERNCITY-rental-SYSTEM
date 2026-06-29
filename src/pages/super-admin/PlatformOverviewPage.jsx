export default function PlatformOverviewPage() {
  const platformStats = {
    totalSessions: "14.2k",
    bounceRate: "24.8%",
    avgDuration: "4m 12s",
    activeNow: 142,
  };

  const userStats = {
    newSignups: 340,
    activeRenters: 280,
    activeOwners: 60,
    retentionRate: "88%",
  };

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">SUPER ADMIN</span>
          <h1 className="h3 mb-0">Platform Overview</h1>
          <p className="text-muted mb-0">Monitor live platform traffic, engagement, and infrastructure metrics.</p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-globe text-primary-custom" /> Platform Traffic Statistics
            </h2>
            <div className="row text-center mt-3">
              <div className="col-6 mb-3">
                <div className="p-3 border rounded">
                  <span className="text-muted d-block mb-1"><small>Total Sessions</small></span>
                  <strong className="h4 text-color">{platformStats.totalSessions}</strong>
                </div>
              </div>
              <div className="col-6 mb-3">
                <div className="p-3 border rounded">
                  <span className="text-muted d-block mb-1"><small>Bounce Rate</small></span>
                  <strong className="h4 text-color">{platformStats.bounceRate}</strong>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 border rounded">
                  <span className="text-muted d-block mb-1"><small>Avg. Session Duration</small></span>
                  <strong className="h4 text-color">{platformStats.avgDuration}</strong>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 border rounded">
                  <span className="text-muted d-block mb-1"><small>Active Users Now</small></span>
                  <strong className="h4 text-danger">{platformStats.activeNow}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-people text-primary-custom" /> User Statistics & Metrics
            </h2>
            <ul className="list-group list-group-flush mt-2">
              <li className="list-group-item bg-transparent text-color d-flex justify-content-between">
                <span>Monthly New Signups</span>
                <strong className="text-success">+{userStats.newSignups}</strong>
              </li>
              <li className="list-group-item bg-transparent text-color d-flex justify-content-between">
                <span>Active Renters</span>
                <strong className="text-color">{userStats.activeRenters}</strong>
              </li>
              <li className="list-group-item bg-transparent text-color d-flex justify-content-between">
                <span>Active Owners</span>
                <strong className="text-color">{userStats.activeOwners}</strong>
              </li>
              <li className="list-group-item bg-transparent text-color d-flex justify-content-between">
                <span>User Retention Rate</span>
                <strong className="text-danger">{userStats.retentionRate}</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-graph-up-arrow text-primary-custom" /> Platform Growth Chart (MTD)
            </h2>
            <div className="p-4 bg-light text-dark rounded text-center">
              <div className="d-flex align-items-end justify-content-center gap-3" style={{ height: "150px" }}>
                <div className="bg-danger rounded" style={{ height: "30%", width: "30px" }} title="Week 1" />
                <div className="bg-danger rounded" style={{ height: "45%", width: "30px" }} title="Week 2" />
                <div className="bg-danger rounded" style={{ height: "65%", width: "30px" }} title="Week 3" />
                <div className="bg-danger rounded animate-pulse" style={{ height: "90%", width: "30px", background: "linear-gradient(185deg, #e31e24, #911013)" }} title="Week 4" />
              </div>
              <div className="d-flex justify-content-center gap-3 mt-2 text-muted"><small>W1</small><small>W2</small><small>W3</small><small>W4</small></div>
              <p className="mt-3 mb-0 text-muted"><small>User activity growth rate increased by 18% this month</small></p>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-cash-stack text-primary-custom" /> Promotion Revenue Chart (YTD)
            </h2>
            <div className="p-4 bg-light text-dark rounded text-center">
              <div className="d-flex align-items-end justify-content-center gap-3" style={{ height: "150px" }}>
                <div className="bg-success rounded" style={{ height: "40%", width: "30px" }} title="Q1" />
                <div className="bg-success rounded" style={{ height: "55%", width: "30px" }} title="Q2" />
                <div className="bg-success rounded" style={{ height: "80%", width: "30px" }} title="Q3" />
                <div className="bg-success rounded animate-pulse" style={{ height: "95%", width: "30px", background: "linear-gradient(185deg, #198754, #0f5132)" }} title="Q4" />
              </div>
              <div className="d-flex justify-content-center gap-4 mt-2 text-muted"><small>Q1</small><small>Q2</small><small>Q3</small><small>Q4</small></div>
              <p className="mt-3 mb-0 text-muted"><small>Promoted listings revenue totals 15,400 ETB</small></p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
