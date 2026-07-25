export default function EmptyState({
  icon = "bi-inbox",
  title = "No data found",
  description = "There is nothing to display right now.",
  action,
}) {
  return (
    <div className="empty-state-premium">
      <div className="empty-state-icon-wrapper">
        <i className={`bi ${icon}`} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
