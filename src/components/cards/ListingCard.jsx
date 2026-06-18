import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { formatDailyPrice } from "../../utils/currency.js";

export default function ListingCard({ item }) {
  const { t } = useLanguage();

  if (!item) {
    return null;
  }

  const displayPrice = item.price || formatDailyPrice(item.pricePerDay || 0);
  const specs = item.specs || [];

  return (
    <article className="motorx-card">
      <div className="motorx-card-img">
        <img src={item.image} alt={item.imageAlt || item.title} />
        {item.featured ? (
          <span className="badge-featured">{t("featured")}</span>
        ) : null}
        {item.year ? <span className="badge-year">{item.year}</span> : null}
        {item.photos ? (
          <span className="badge-photos">
            <i className="bi bi-camera"></i> {item.photos}
          </span>
        ) : null}
      </div>

      <div className="motorx-card-body">
        <span className="card-similar">
          {item.categoryKey ? t(item.categoryKey) : item.category || t("rentalItem")}
          {item.similarCount ? ` - ${item.similarCount} ${t("similar")}` : ""}
        </span>
        <h3>{item.title}</h3>
        <p className="card-price">
          {displayPrice} <small>/ {t("perDay")}</small>
        </p>

        <div className="card-specs">
          {specs.map((spec, index) => (
            <span key={`${item.id}-${spec.labelKey || spec.label || index}`}>
              <i className={`bi ${spec.icon}`}></i>{" "}
              {spec.labelKey ? t(spec.labelKey) : spec.label}
            </span>
          ))}
        </div>

        <div className="card-footer">
          <Link to={`/items/${item.id}`} className="view-details">
            {t("viewDetails")} <i className="bi bi-arrow-up-right"></i>
          </Link>

          <div className="card-actions">
            <button type="button" className="icon-btn" aria-label={t("compare")}>
              <i className="bi bi-arrow-left-right"></i>
            </button>
            <button type="button" className="icon-btn" aria-label={t("wishlist")}>
              <i className="bi bi-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
