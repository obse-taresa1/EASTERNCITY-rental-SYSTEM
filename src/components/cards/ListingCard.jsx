import { Link } from "react-router-dom";

export default function ListingCard({
  id,
  title,
  image,
  price,
  location,
  category,
  meta,
  year,
  status,
}) {
  return (
    <div className="col-md-6 col-xl-4" data-status={status || "used"}>
      <article className="motorx-card h-100">
        <div className="motorx-card-img-wrap">
          {year && <span className="badge-year">{year}</span>}
          <img src={image} alt={title} />
        </div>

        <div className="motorx-card-body">
          <p className="card-similar">{category}</p>
          <h3>{title}</h3>
          {meta && <p className="card-meta">{meta}</p>}
          <p className="card-price">
            {price} <small>/ day</small>
          </p>

          <div className="card-footer-flex">
            <span>
              <i className="bi bi-geo-alt"></i> {location}
            </span>

            <Link className="view-details" to={`/item-details/${id}`}>
              View Details
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
