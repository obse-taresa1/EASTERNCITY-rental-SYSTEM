import { formatDailyPrice } from "../../utils/currency.js";

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' fill='%23e2e8f0'%3E%3Crect width='150' height='150' rx='12'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='13' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ListingManagementTable({ items, onPromote, onEdit, onDelete }) {
  return (
    <div className="row g-4">
      {items.map((item) => {
        const s = String(item.status || (item.available ? "active" : "inactive")).toLowerCase().replace(/\s+/g, "-");
        let badgeClass = "badge-pending";
        let badgeLabel = item.status || (item.available ? "Active" : "Inactive");
        
        if (["approved", "active", "published", "renewed", "completed"].includes(s)) {
          badgeClass = "badge-confirmed";
        } else if (["rejected", "cancelled"].includes(s)) {
          badgeClass = "badge-rejected";
        } else if (["booking-requested", "requests", "under-review"].includes(s)) {
          badgeClass = "badge-waiting";
        }

        const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : null;

        return (
          <div className="col-12" key={item.id}>
            <div className="premium-glass-card bg-white p-4 h-100 d-flex flex-column flex-md-row gap-4 align-items-center listing-card-hover" style={{ borderRadius: "16px", border: "1px solid #e8edf3", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              {/* Image */}
              <div className="flex-shrink-0" style={{ width: "100%", maxWidth: "150px" }}>
                <img
                  src={item.image || PLACEHOLDER_IMG}
                  alt={item.title}
                  style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "12px" }}
                  onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMG; }}
                  className="w-100"
                />
              </div>

              {/* Info */}
              <div className="flex-grow-1 w-100">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <h4 className="fw-bold m-0" style={{ fontSize: "1.25rem", color: "#0f172a" }}>{item.title}</h4>
                  <span className={`booking-status-badge ${badgeClass} border`}>
                    {badgeLabel}
                  </span>
                  {item.featured && (
                    <span className="booking-status-badge bg-danger text-white border-danger">
                      Featured
                    </span>
                  )}
                </div>
                <div className="text-muted small fw-bold mb-2">
                  <i className="bi bi-tag me-1" /> {item.category}
                </div>
                
                <div className="d-flex flex-wrap gap-4 mt-3">
                  <div>
                    <div className="text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Price</div>
                    <div className="fw-bold text-danger" style={{ fontSize: "1.05rem" }}>{formatDailyPrice(item.pricePerDay)}</div>
                  </div>
                  <div>
                    <div className="text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Location</div>
                    <div className="fw-bold text-dark"><i className="bi bi-geo-alt text-danger me-1" />{item.location}</div>
                  </div>
                  {formattedDate && (
                    <div>
                      <div className="text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Listed On</div>
                      <div className="fw-bold text-dark">{formattedDate}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex flex-md-column gap-2 text-md-end ms-md-auto align-items-md-end w-100 mt-3 mt-md-0" style={{ maxWidth: "160px" }}>
                <button 
                  className="btn btn-outline-primary rounded-pill fw-bold px-3 py-2 w-100 d-flex align-items-center justify-content-center gap-2" 
                  style={{ whiteSpace: "nowrap" }}
                  onClick={() => onEdit && onEdit(item)}
                >
                  <i className="bi bi-pencil" /> Edit
                </button>
                <button 
                  className="btn btn-outline-danger rounded-pill fw-bold px-3 py-2 w-100 d-flex align-items-center justify-content-center gap-2 listing-delete-btn" 
                  style={{ whiteSpace: "nowrap" }}
                  onClick={() => onDelete && onDelete(item)}
                >
                  <i className="bi bi-trash" /> Delete
                </button>
                {onPromote && ["approved", "published", "active", "renewed"].includes(s) && !item.featured && (
                  <button
                    className="btn btn-danger rounded-pill fw-bold px-3 py-2 w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => onPromote(item)}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    <i className="bi bi-megaphone" /> Promote
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
