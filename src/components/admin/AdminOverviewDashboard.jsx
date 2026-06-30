const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function StatPill({ icon, label, value }) {
  return (
    <div className="red-market-stat-pill">
      <i className={`bi ${icon}`} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniCard({ icon, name, value, helper, color = "#ef4444" }) {
  return (
    <article className="red-mini-campaign-card red-market-mini-card">
      <div className="red-mini-card-top">
        <span className="red-social-icon" style={{ color }}>
          <i className={`bi ${icon}`} />
        </span>
        <div>
          <small>{helper}</small>
          <strong>{name}</strong>
        </div>
        <span className="red-status-dot">Live</span>
      </div>
      <div className="red-mini-card-body">
        <strong>{value}</strong>
        <span>{helper}</span>
        <div className="red-sparkline" aria-hidden="true" />
      </div>
    </article>
  );
}

function RingMetric({ label, value, color }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="red-ring-metric">
      <div
        className="red-ring"
        style={{ "--value": `${safeValue}%`, "--ring-color": color }}
      >
        <span>{safeValue}%</span>
      </div>
      <small><i style={{ background: color }} />{label}</small>
    </div>
  );
}

function PieBreakdown({ breakdown = [] }) {
  const visibleBreakdown = breakdown.slice(0, 3);

  return (
    <div className="red-mail-content red-market-breakdown">
      <div className="red-pie-chart">
        {visibleBreakdown.map((item, index) => (
          <span className={`pie-${["one", "two", "three"][index]}`} key={item.label}>
            {item.percent}%
          </span>
        ))}
      </div>
      <ul>
        {visibleBreakdown.map((item, index) => (
          <li key={item.label}>
            <i className={`dot ${["sent", "pending", "cancel"][index]}`} />
            <strong>{item.label}</strong>
            <span>{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminOverviewDashboard({
  variant = "admin",
  overview = {},
  statCards = [],
  breakdown = [],
  ringMetrics = [],
  miniCards = [],
  chart = {},
  rows = [],
}) {
  const isSuper = variant === "superadmin";
  const title = overview.title || (isSuper ? "Platform Overview" : "Marketplace Overview");
  const primaryValue = overview.primaryValue ?? 0;
  const primaryLabel = overview.primaryLabel || (isSuper ? "Platform Users" : "Active Listings");
  const primaryStats = overview.stats || [];
  const chartValues = chart.values?.length ? chart.values : MONTHS.map(() => 0);
  const maxChartValue = Math.max(...chartValues, 1);

  return (
    <main className="dashboard-content red-dashboard-page">
      <section className="red-dashboard-grid">
        <article className="red-overview-card red-card-primary">
          <button className="red-card-menu" type="button" aria-label="More options">
            <i className="bi bi-three-dots" />
          </button>
          <h2>{title}</h2>
          <div className="red-overview-main">
            <strong>{primaryValue}</strong>
            <span>{primaryLabel}</span>
            <div className="red-platform-icons">
              {(overview.icons || ["bi-people", "bi-box-seam", "bi-megaphone"]).map((icon) => (
                <span key={icon}><i className={`bi ${icon}`} /></span>
              ))}
            </div>
          </div>
          <div className="red-overview-stats">
            {primaryStats.map((item) => (
              <span key={item.label}>{item.value} {item.label}</span>
            ))}
          </div>
          <label className="red-campaign-search">
            <i className="bi bi-search" />
            <input placeholder={overview.searchPlaceholder || "Search marketplace data"} readOnly />
          </label>
        </article>

        <article className="red-glass-card red-mail-card red-market-stats-card">
          <button className="red-card-menu" type="button" aria-label="More options">
            <i className="bi bi-three-dots" />
          </button>
          <h2>{isSuper ? "Platform Statistics" : "Marketplace Statistics"}</h2>
          <div className="red-market-stat-grid">
            {statCards.map((stat) => (
              <StatPill key={stat.label} {...stat} />
            ))}
          </div>
        </article>

        <article className="red-glass-card red-traffic-card">
          <button className="red-card-menu" type="button" aria-label="More options">
            <i className="bi bi-three-dots" />
          </button>
          <h2>{isSuper ? "System Health" : "Operational Health"}</h2>
          <div className="red-ring-row">
            {ringMetrics.slice(0, 3).map((metric) => (
              <RingMetric key={metric.label} {...metric} />
            ))}
          </div>
        </article>

        <div className="red-mini-card-stack">
          {miniCards.slice(0, 3).map((card) => (
            <MiniCard key={card.name} {...card} />
          ))}
        </div>

        <article className="red-glass-card red-analytics-card">
          <div className="red-card-header-row">
            <div>
              <h2>{chart.title || (isSuper ? "Platform Analytics" : "Marketplace Analytics")}</h2>
              <div className="red-legend-row">
                {(chart.legends || []).map((legend, index) => (
                  <span key={legend}><i className={`legend-${["add", "facebook", "instagram", "youtube"][index % 4]}`} />{legend}</span>
                ))}
              </div>
            </div>
            <div className="red-filter-row">
              <button type="button">{chart.primaryFilter || "Marketplace"} <i className="bi bi-chevron-down" /></button>
              <button type="button">Monthly <i className="bi bi-chevron-down" /></button>
            </div>
          </div>
          <div className="red-bar-chart">
            {MONTHS.map((month, index) => {
              const height = Math.max(18, Math.round((Number(chartValues[index]) || 0) / maxChartValue * 132));
              return (
                <div className="red-bar-column" key={month}>
                  <span className="red-bar" style={{ height: `${height}px` }} />
                  <small>{month}</small>
                </div>
              );
            })}
          </div>
          {breakdown.length > 0 && <PieBreakdown breakdown={breakdown} />}
        </article>

        <article className="red-glass-card red-schedule-card">
          <div className="red-card-header-row">
            <h2>{isSuper ? "Recent Platform Records" : "Recent Marketplace Records"}</h2>
            <div className="red-filter-row">
              <button type="button"><i className="bi bi-funnel" /> Filter</button>
              <button type="button"><i className="bi bi-box-arrow-up-right" /> Export</button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table red-schedule-table">
              <thead>
                <tr>
                  <th><input type="checkbox" aria-label="Select all" /></th>
                  <th>No</th>
                  <th>Record</th>
                  <th>Status</th>
                  <th>Date & time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? rows.slice(0, 8).map((row, index) => (
                  <tr key={row.id || index}>
                    <td><input type="checkbox" aria-label={`Select row ${index + 1}`} /></td>
                    <td>{String(index + 1).padStart(2, "0")}</td>
                    <td>
                      <strong>{row.type || row.label || "Record"}</strong>
                      {row.detail && <span className="red-table-subtext">{row.detail}</span>}
                    </td>
                    <td>{row.status || "Active"}</td>
                    <td>{row.date || "-"}</td>
                    <td><i className="bi bi-three-dots-vertical" /></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">No recent records yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}
