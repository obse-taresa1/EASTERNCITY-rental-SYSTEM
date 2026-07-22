import DashboardStatCard from "../dashboard/DashboardStatCard.jsx";

export default function AdminStatGrid({ stats }) {
  return (
    <div className="row g-4 my-4">
      {stats.map((stat) => (
        <div className="col-md-3" key={stat.label}>
          <DashboardStatCard
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            tone={stat.tone}
          />
        </div>
      ))}
    </div>
  );
}
