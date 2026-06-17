const statusClassMap = {
  active: "badge bg-success",
  approved: "badge bg-success",
  completed: "badge bg-success",
  pending: "badge bg-warning text-dark",
  rejected: "badge bg-danger",
  cancelled: "badge bg-danger",
  inactive: "badge bg-secondary",
};

export default function StatusBadge({ status }) {
  const normalizedStatus = String(status || "pending").toLowerCase();
  const badgeClass = statusClassMap[normalizedStatus] || "badge bg-secondary";

  return <span className={badgeClass}>{status}</span>;
}
