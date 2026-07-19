import { useMemo, useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

function StatPill({ icon, label, value }) {
  return (
    <div className="red-market-stat-pill">
      <i className={`bi ${icon}`} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MiniCard({ icon, name, value, helper, color = "#8f1d33" }) {
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

function DateRangeControls({ filters = {}, onFiltersChange }) {
  const range = filters.range || "month";

  function update(next) {
    onFiltersChange?.({ ...filters, ...next });
  }

  return (
    <div className="red-filter-row red-date-filter-row">
      <select value={range} onChange={(event) => update({ range: event.target.value })} aria-label="Dashboard date range">
        {RANGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {range === "custom" && (
        <>
          <input type="date" value={filters.from || ""} onChange={(event) => update({ from: event.target.value })} aria-label="Start date" />
          <input type="date" value={filters.to || ""} onChange={(event) => update({ to: event.target.value })} aria-label="End date" />
        </>
      )}
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
  dateRange = "month",
  startDate = "",
  endDate = "",
  onDateRangeChange,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const isSuper = variant === "superadmin";
  const title = overview.title || (isSuper ? "Platform Overview" : "Marketplace Overview");
  const primaryValue = loading ? "..." : overview.primaryValue ?? 0;
  const primaryLabel = overview.primaryLabel || (isSuper ? "Platform Users" : "Active Listings");
  const primaryStats = overview.stats || [];
  const chartValues = chart.values?.length ? chart.values : MONTHS.map(() => 0);
  const maxChartValue = Math.max(...chartValues, 1);
  const statuses = useMemo(
    () => [
      "all",
      ...Array.from(new Set(rows.map((row) => row.status).filter(Boolean))),
    ],
    [rows],
  );
  const filteredRows = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (statusFilter !== "all" && row.status !== statusFilter) return false;
        if (!searchTerm) return true;
        return [row.type, row.detail, row.status, row.date]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchTerm));
      })
      .sort((a, b) => {
        const aDate = new Date(a.date || 0).getTime() || 0;
        const bDate = new Date(b.date || 0).getTime() || 0;
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      });
  }, [rows, search, statusFilter, sortDirection]);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  function updateRange(nextRange, nextStartDate = startDate, nextEndDate = endDate) {
    setPage(1);
    onDateRangeChange?.({
      range: nextRange,
      startDate: nextStartDate,
      endDate: nextEndDate,
    });
  }

  return (
    <main className="dashboard-content red-dashboard-page">
      {error && <div className="red-dashboard-alert">{error}</div>}
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
              <span key={item.label}>{loading ? "..." : item.value} {item.label}</span>
            ))}
          </div>
          <label className="red-campaign-search">
            <i className="bi bi-search" />
            <input
              placeholder={overview.searchPlaceholder || "Search marketplace data"}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>
        </article>

        <article className="red-glass-card red-mail-card red-market-stats-card">
          <button className="red-card-menu" type="button" aria-label="More options">
            <i className="bi bi-three-dots" />
          </button>
          <h2>{isSuper ? "Platform Statistics" : "Marketplace Statistics"}</h2>
          <div className="red-market-stat-grid">
            {statCards.map((stat) => (
              <StatPill key={stat.label} {...stat} value={loading ? "..." : stat.value} />
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
              <RingMetric key={metric.label} {...metric} value={loading ? 0 : metric.value} />
            ))}
          </div>
        </article>

        <div className="red-mini-card-stack">
          {miniCards.slice(0, 3).map((card) => (
            <MiniCard key={card.name} {...card} value={loading ? "..." : card.value} />
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
              <select
                aria-label="Dashboard date range"
                value={dateRange}
                onChange={(event) => updateRange(event.target.value)}
              >
                {RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          {dateRange === "custom" && (
            <div className="red-filter-row mb-3">
              <input
                type="date"
                value={startDate}
                onChange={(event) => updateRange("custom", event.target.value, endDate)}
              />
              <input
                type="date"
                value={endDate}
                onChange={(event) => updateRange("custom", startDate, event.target.value)}
              />
            </div>
          )}
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
              <select
                aria-label="Filter records by status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All Statuses" : status}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
              >
                <i className="bi bi-sort-down" /> {sortDirection === "asc" ? "Oldest" : "Newest"}
              </button>
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
                {visibleRows.length > 0 ? visibleRows.map((row, index) => (
                  <tr key={row.id || index}>
                    <td><input type="checkbox" aria-label={`Select row ${index + 1}`} /></td>
                    <td>{String((safePage - 1) * pageSize + index + 1).padStart(2, "0")}</td>
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
                    <td colSpan="6" className="text-center py-4">{loading ? "Loading live dashboard records..." : "No recent records yet."}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="red-filter-row justify-content-end mt-3">
            <button type="button" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Previous
            </button>
            <button type="button" disabled>
              Page {safePage} of {totalPages}
            </button>
            <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
              Next
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
