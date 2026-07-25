export default function DashboardStatCard({ icon, label, value, tone = "primary" }) {
  return (
    <div className="dashboard-stat-card">
      {/* Errors 1 & 2: Fixed template literal with backticks */}
      <div className={`dashboard-stat-icon text-${tone}`} style={{ fontSize: '28px' }}>
        {/* Errors 3 & 4: Fixed template literal with backticks */}
        <i className={`bi ${icon}`} />
      </div>

      <div>
        <p className="text-muted mb-1">{label}</p>
        <h3 className="mb-0" style={{ fontSize: '28px', fontWeight: '600' }}>{value}</h3>
      </div>
    </div>
  );
}