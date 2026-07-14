import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { categories } from "../../data/items.js";
import { getPromotionLabel } from "../../services/itemService.js";
import { formatDailyPrice } from "../../utils/currency.js";
import fallbackListingImage from "../../assets/images/pc.png";

export default function ListingCard({ item }) {
  const { t } = useLanguage();

  if (!item) return null;

  const displayPrice = item.price || formatDailyPrice(item.pricePerDay || 0);
  const promotionLabel = getPromotionLabel(item);
  const specs = item.specs || [
    {
      icon: "bi-geo-alt",
      label: item.sefar
        ? `${item.city} • ${item.sefar}`
        : item.city || "EasternCity",
    },
    { icon: "bi-clock", label: t("perDay") },
  ];
  const categoryName =
    item.categoryName ||
    categories.find((category) => category.id === item.category)?.name ||
    item.category;

  return (
    <article className="premium-glass-card listing-card-premium">
      <div className="card-img-wrapper">
        <img
          src={item.image || item.coverImage || fallbackListingImage}
          alt={item.imageAlt || item.title}
          className="card-img"
        />
        <div className="card-badges">
          {item.featured && (
            <span className="badge-featured">{promotionLabel || t("featured")}</span>
          )}
          {item.city && (
            <span className="badge-city">
              <i className="bi bi-geo-alt-fill"></i> {item.city}
              {item.sefar ? ` • ${item.sefar}` : ""}
            </span>
          )}
        </div>
        {item.photos && (
          <span className="badge-photos">
            <i className="bi bi-camera"></i> {item.photos}
          </span>
        )}
      </div>

      <div className="card-body-premium">
        <div className="card-header-top">
          <span className="card-category">
            {item.categoryKey
              ? t(item.categoryKey)
              : categoryName || t("rentalItem")}
          </span>
          {item.rating && (
            <span className="card-rating">
              <i className="bi bi-star-fill"></i> {item.rating}
            </span>
          )}
        </div>

        <h3 className="card-title">{item.title}</h3>

        <p className="card-price-premium">
          <strong>{displayPrice}</strong> <small>/ {t("perDay")}</small>
        </p>

        <div className="card-owner-info">
          <div className="owner-avatar">
            {item.ownerName ? item.ownerName.charAt(0) : "U"}
          </div>
          <span className="owner-name">
            {item.ownerName || "Verified Owner"}
          </span>
          {item.verifiedOwner !== false && (
            <i
              className="bi bi-patch-check-fill text-success"
              title="Verified Owner"
            ></i>
          )}
        </div>

        <div className="card-specs-grid">
          {specs.map((spec, index) => (
            <span
              key={`${item.id}-${spec.labelKey || spec.label || index}`}
              className="spec-item"
            >
              <i className={`bi ${spec.icon}`}></i>{" "}
              {spec.labelKey ? t(spec.labelKey) : spec.label}
            </span>
          ))}
        </div>

        <div className="card-footer-premium">
          <Link to={`/items/${item.id}`} className="btn-view-details">
            {t("viewDetails")} <i className="bi bi-arrow-right"></i>
          </Link>
          <div className="card-icon-actions">
            <button
              type="button"
              className="btn-icon-soft"
              aria-label={t("compare")}
            >
              <i className="bi bi-arrow-left-right"></i>
            </button>
            <button
              type="button"
              className="btn-icon-soft"
              aria-label={t("wishlist")}
            >
              <i className="bi bi-heart"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
