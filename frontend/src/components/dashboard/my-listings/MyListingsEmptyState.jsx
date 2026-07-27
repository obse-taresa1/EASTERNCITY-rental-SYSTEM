import { Link } from "react-router-dom";

export default function MyListingsEmptyState({
  icon,
  title,
  description,
  showAddButton = false,
}) {
  return (
    <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-light">
      <div className="mb-3">
        <i
          className={`bi ${icon} text-danger opacity-50`}
          style={{ fontSize: "4rem" }}
        ></i>
      </div>
      <h3 className="fw-bold">{title}</h3>
      {description && <p className="text-muted">{description}</p>}
      {showAddButton && (
        <Link
          to="/list-item"
          className="btn btn-danger rounded-pill fw-bold mt-3 px-4 py-2"
        >
          <i className="bi bi-plus-circle me-2" /> Add Listing
        </Link>
      )}
    </div>
  );
}
