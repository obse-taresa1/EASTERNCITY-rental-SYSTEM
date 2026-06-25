const statusClassMap = {
  active: "badge bg-success",
  approved: "badge bg-success",
  published: "badge bg-success",
  renewed: "badge bg-success",
  completed: "badge bg-success",
  pending: "badge bg-warning text-dark",
  "pending approval": "badge bg-warning text-dark",
  draft: "badge bg-info text-dark",
  featured: "badge bg-danger",
  expired: "badge bg-secondary",
  rejected: "badge bg-danger",
  cancelled: "badge bg-danger",
  inactive: "badge bg-secondary",
};

export default function StatusBadge({ status }) {
  const normalizedStatus = String(status || "pending").toLowerCase();
  const badgeClass = statusClassMap[normalizedStatus] || "badge bg-secondary";

  return <span className={badgeClass}>{status}</span>;
}
