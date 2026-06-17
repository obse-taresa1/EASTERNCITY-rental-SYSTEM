import { Link } from "react-router-dom";
import { formatDailyPrice } from "../../utils/currency.js";

export default function ListingCard({ item }) {
  if (!item) {
    return null;
  }

  const displayPrice = item.price || formatDailyPrice(item.pricePerDay || 0);
  const specs = item.specs || [];

  return (
    <article className="motorx-card">
      <div className="motorx-card-img">
        <img src={item.image} alt={item.imageAlt || item.title} />
        {item.featured ? <span className="badge-featured">Featured</span> : null}
        {item.year ? <span className="badge-year">{item.year}</span> : null}
        {item.photos ? (
          <span className="badge-photos">
            <i className="bi bi-camera"></i> {item.photos}
          </span>
        ) : null}
      </div>

      <div className="motorx-card-body">
        <span className="card-similar">
          {item.similar || item.category || "Rental Item"}
        </span>
        <h3>{item.title}</h3>
        <p className="card-price">
          {displayPrice} <small>/ day</small>
        </p>

        <div className="card-specs">
          {specs.map((spec) => (
            <span key={`${item.id}-${spec.label}`}>
              <i className={`bi ${spec.icon}`}></i> {spec.label}
            </span>
          ))}
        </div>

        <div className="card-footer">
          <Link to={`/items/${item.id}`} className="view-details">
            VIEW DETAILS <i className="bi bi-arrow-up-right"></i>
          </Link>

          <div className="card-actions">
            <button type="button" className="icon-btn" aria-label="Compare">
              <i className="bi bi-arrow-left-right"></i>
            </button>
            <button type="button" className="icon-btn" aria-label="Wishlist">
              <i className="bi bi-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
