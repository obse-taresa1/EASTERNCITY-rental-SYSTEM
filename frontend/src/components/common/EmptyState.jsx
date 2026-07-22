export default function EmptyState({
  icon = "bi-inbox",
  title = "No data found",
  description = "There is nothing to display right now.",
  action,
}) {
  return (
    <div className="text-center py-5">
      <i className={`bi ${icon} display-5 text-muted d-block mb-3`} />
      <h3 className="h5 mb-2">{title}</h3>
      <p className="text-muted mb-4">{description}</p>
      {action}
    </div>
  );
}
