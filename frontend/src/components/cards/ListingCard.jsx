import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useRefresh, useRefreshToken } from "../../context/RefreshContext.jsx";
import {
  getStorageItem,
  setStorageItem,
} from "../../services/storageService.js";
import { categories } from "../../data/items.js";
import { getPromotionLabel } from "../../services/itemService.js";
import { formatDailyPrice } from "../../utils/currency.js";
import { getCategoryFallbackImage } from "../../utils/categoryFallbacks.js";
import CardImageSlider from "./CardImageSlider.jsx";

const SAVED_KEY = "saved_items";

function toSavedItem(item, userId) {
  return {
    id: item.id,
    userId,
    title: item.title,
    image: item.image || item.coverImage || "",
    location: item.location || item.sefar || item.city || "",
    price: item.price || "",
    pricePerDay: item.pricePerDay || 0,
  };
}

export default function ListingCard({
  item,
  viewMode = "grid",
  onContact,
  onBook,
  showCondition = false,
}) {
  const { t } = useLanguage();
  const { currentUser, isAuthenticated, user } = useAuth();
  const { refresh } = useRefresh();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSaved, setIsSaved] = useState(false);
  const activeUser = user || currentUser;
  const savedItemsRefreshToken = useRefreshToken("savedItems");

  useEffect(() => {
    if (!item?.id) return;
    const savedItems = getStorageItem(SAVED_KEY, []);
    setIsSaved(
      savedItems.some(
        (savedItem) =>
          savedItem.id === item.id &&
          String(savedItem.userId || "") === String(activeUser?.id || ""),
      ),
    );
  }, [activeUser?.id, item?.id, savedItemsRefreshToken]);

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
  // item.category may be a string (id) OR a full object {id, name, slug, ...}
  const categoryObj = item.category && typeof item.category === "object" ? item.category : null;
  const categoryId = categoryObj ? categoryObj.id : item.category;
  const categoryName =
    item.categoryName ||
    categoryObj?.name ||
    categories.find((cat) => cat.id === categoryId)?.name ||
    (typeof item.category === "string" ? item.category : "");
  const categoryMeta = categories.find(
    (cat) => cat.id === categoryId || cat.name === categoryName,
  );
  const displayCategoryName = categoryMeta?.nameKey
    ? t(categoryMeta.nameKey)
    : categoryName || t("rentalItem");

  function handleToggleSaved() {
    if (!isAuthenticated || !activeUser?.id) {
      navigate("/login", {
        state: { from: location },
      });
      return;
    }

    const savedItems = getStorageItem(SAVED_KEY, []);
    const nextSavedState = !savedItems.some(
      (savedItem) =>
        savedItem.id === item.id &&
        String(savedItem.userId || "") === String(activeUser?.id || ""),
    );
    const updatedItems = nextSavedState
      ? [toSavedItem(item, activeUser.id), ...savedItems]
      : savedItems.filter(
          (savedItem) =>
            !(
              savedItem.id === item.id &&
              String(savedItem.userId || "") === String(activeUser.id)
            ),
        );

    setStorageItem(SAVED_KEY, updatedItems);
    setIsSaved(nextSavedState);
    refresh("savedItems");
  }

  const fallbackKey = categoryMeta?.id || categoryObj?.slug || categoryId;

  return (
    <article className="premium-glass-card listing-card-premium">
      <CardImageSlider
        images={item.images || []}
        coverImage={item.image || item.coverImage || ""}
        fallbackKey={fallbackKey}
        title={item.title}
        isFeatured={!!(item.featured || item.isFeatured)}
        city={item.city || ""}
        sefar={item.sefar || ""}
        condition={showCondition ? (item.condition || "") : ""}
      />

      <div className="card-body-premium">
        <div className="card-header-top">
          <span className="card-category">
            {item.categoryKey
              ? t(item.categoryKey)
              : displayCategoryName}
          </span>
          {item.rating && (
            <span className="card-rating">
              <i className="bi bi-star-fill"></i> {item.rating}
            </span>
          )}
        </div>

        <h3 className="card-title">{item.title}</h3>

        <div className="card-price-premium d-flex align-items-center">
          {item.discountPercent && item.discountPercent > 0 ? (
            <div className="d-flex align-items-center flex-wrap gap-1">
              <span className="text-decoration-line-through text-muted small" style={{ fontSize: '0.85rem' }}>
                ETB {Number(item.originalPrice ?? item.pricePerDay ?? 0).toLocaleString()}
              </span>
              <strong>ETB {Number(item.discountedPrice ?? 0).toLocaleString()}</strong>
            </div>
          ) : (
            <strong>{displayPrice}</strong>
          )}
        </div>

        <div className="card-owner-info mt-3">
          <div className="owner-avatar">
            {item.ownerName ? item.ownerName.charAt(0) : "U"}
          </div>
          <span className="owner-name">
            {item.ownerName || t("verifiedOwner")}
          </span>
          {item.verifiedOwner !== false && (
            <i
              className="bi bi-patch-check-fill text-success"
              title={t("verifiedOwner")}
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
              onClick={handleToggleSaved}
            >
              <i className={`bi ${isSaved ? "bi-heart-fill" : "bi-heart"}`}></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
