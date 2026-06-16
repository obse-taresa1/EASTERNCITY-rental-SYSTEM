export default function StatCard({ icon, label, value, color = "blue" }) {
  return (
    <div className="card card-custom stat-card">
      <div className={`stat-icon ${color}`}>
        <i className={`bi ${icon}`}></i>
      </div>

      <div>
        <p className="text-muted mb-0 small">{label}</p>
        <h3 className="mb-0">{value}</h3>
      </div>
    </div>
  );
}
