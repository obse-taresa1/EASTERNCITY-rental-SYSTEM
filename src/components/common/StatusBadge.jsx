const statusClassMap = {
  active: "badge bg-success",
  approved: "badge bg-success",
  accepted: "badge bg-success",
  published: "badge bg-success",
  renewed: "badge bg-success",
  completed: "badge bg-success",
  pending: "badge bg-warning text-dark",
  "pending review": "badge bg-warning text-dark",
  "payment pending": "badge bg-warning text-dark",
  "under review": "badge bg-info text-dark",
  "pending approval": "badge bg-warning text-dark",
  draft: "badge bg-info text-dark",
  featured: "badge bg-danger",
  published: "badge bg-success",
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
