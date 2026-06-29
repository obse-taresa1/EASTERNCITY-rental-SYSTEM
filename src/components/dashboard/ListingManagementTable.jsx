import StatusBadge from "../common/StatusBadge.jsx";
import { formatDailyPrice } from "../../utils/currency.js";

export default function ListingManagementTable({ items, onPromote }) {
  return (
    <div className="listing-grid">
      {items.map((item) => (
        <div key={item.id} className="listing-card">
          {/* Image on top */}
          <a href={item.image} target="_blank" rel="noopener noreferrer">
            <img src={item.image} alt={item.title} className="listing-card-img" />
          </a>
          {/* Title */}
          <h5 className="listing-card-title mt-2 mb-1">{item.title}</h5>
          {/* Details */}
          <p className="text-capitalize mb-1"><strong>Category:</strong> {item.category}</p>
          <p className="mb-1"><strong>Price:</strong> {formatDailyPrice(item.pricePerDay)}</p>
          <p className="mb-1"><strong>Location:</strong> {item.location}</p>
          {/* Status badge */}
          <div className="d-flex align-items-center mb-2">
            <StatusBadge
              status={item.status || (item.available ? "active" : "inactive")}
            />
            {item.featured && (
              <span className="owner-featured-badge ms-2">Featured</span>
            )}
          </div>
          {/* Action buttons – wrap on small screens */}
          <div className="listing-card-actions">
            <button className="btn btn-sm btn-outline-dark" title="Edit">
              <i className="bi bi-pencil" />
            </button>
            <button className="btn btn-sm btn-outline-danger" title="Delete">
              <i className="bi bi-trash" />
            </button>
            {onPromote && ["published", "active", "renewed", "featured"].includes(
              String(item.status || (item.available ? "active" : "inactive")).toLowerCase()
            ) && (
              <button
                className="btn btn-sm btn-accent-custom"
                onClick={() => onPromote(item)}
                title="Promote"
              >
                <i className="bi bi-megaphone" /> Promote
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
