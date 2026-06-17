import { Link } from "react-router-dom";
import { formatDailyPrice } from "../../utils/currency.js";

export default function ListingCard({ item }) {
  if (!item) {
    return null;
  }

  return (
    <div className="listing-card h-100">
      <div className="listing-img">
        {/* Error 1: Fixed missing || operator */}
        {/* Error 9: Added error handling */}
        <img 
          src={item.image} 
          alt={item.title || "Listing image"}
          onError={(e) => {
            e.target.src = "/images/placeholder.jpg";
          }}
        />

        {/* Error 2: Fixed missing || operator */}
        <span className="listing-price">
          {formatDailyPrice(item.pricePerDay || 0)}
        </span>
      </div>

      <div className="listing-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          {/* Error 3: Fixed missing || operator */}
          <h3>{item.title || "Untitled"}</h3>

          <span className="rating">
            <i className="bi bi-star-fill" /> 
            {/* Error 4: Fixed missing || operator */}
            {item.rating || "0.0"}
          </span>
        </div>

        <p className="text-muted mb-2">
          <i className="bi bi-geo-alt" />{" "}
          {/* Error 5: Fixed missing || operator */}
          {item.location || "Location not specified"}
        </p>

        <p className="listing-description">
          {/* Error 6: Fixed missing || operator */}
          {item.description || "No description available"}
        </p>

        {/* Errors 7 & 8: Fixed template literal */}
        <Link
          to={`/items/${item.id}`}
          className="btn btn-accent-custom w-100"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
