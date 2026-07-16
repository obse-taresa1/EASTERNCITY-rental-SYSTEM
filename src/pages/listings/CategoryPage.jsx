import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { categories } from "../../data/items.js";
import { fetchCategories } from "../../services/categoryApiService.js";
import { getPublicListings } from "../../services/listingApiService.js";
import { formatDailyPrice } from "../../utils/currency.js";
import { getSefarByCity } from "../../data/sefar.js";

function normalizeFilterValue(value) {
  return String(value || "").trim().toLowerCase();
}

function getCategoryTokens(value) {
  return normalizeFilterValue(value)
    .replace(/&/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function getCategoryKey(category) {
  return category?.slug || category?.id || "";
}

function categoryMatches(item, selectedCategory) {
  const selectedValues = [
    selectedCategory?.id,
    selectedCategory?.slug,
    selectedCategory?.name,
  ].map(normalizeFilterValue);

  const itemValues = [
    item.category,
    item.categoryName,
    item.categoryData?.id,
    item.categoryData?.slug,
    item.categoryData?.name,
  ].map(normalizeFilterValue);

  return selectedValues.some(
    (selected) => selected && itemValues.includes(selected),
  ) || selectedValues.some((selected) => {
    const selectedTokens = getCategoryTokens(selected);
    if (!selectedTokens.length) return false;

    return itemValues.some((value) => {
      const itemTokens = getCategoryTokens(value);
      return itemTokens.some((token) => selectedTokens.includes(token));
    });
  });
}

export default function CategoryPage() {
  const { categoryId } = useParams();
  const { t } = useLanguage();

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [sefar, setSefar] = useState("all");
  const [maxPrice, setMaxPrice] = useState(25000);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);
  const [listings, setListings] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState(categories);
  const [loading, setLoading] = useState(true);

  const category =
    categoryOptions.find(
      (item) =>
        normalizeFilterValue(item.id) === normalizeFilterValue(categoryId) ||
        normalizeFilterValue(item.slug) === normalizeFilterValue(categoryId),
    ) || null;

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      try {
        const [listingData, categoryData] = await Promise.all([
          getPublicListings(),
          fetchCategories().catch(() => []),
        ]);
        if (!active) return;
        setListings(listingData);
        setCategoryOptions([
          ...categories,
          ...categoryData.map((item) => ({
            ...item,
            id: getCategoryKey(item),
            icon:
              categories.find((category) => category.id === item.slug)?.icon ||
              "bi-grid",
          })),
        ]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [categoryId]);

  const allItems = useMemo(
    () =>
      category
        ? listings.filter((item) => categoryMatches(item, category))
        : [],
    [listings, categoryId, category],
  );

  const sefarOptions = city !== "all" ? getSefarByCity(city) : [];

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (search && !item.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (city !== "all" && item.city !== city) return false;
      if (sefar !== "all") {
        const itemSefar = String(item.sefar || "").toLowerCase();
        const itemLocation = String(item.location || "").toLowerCase();
        const selectedSefar = String(sefar).toLowerCase();
        if (
          itemSefar !== selectedSefar &&
          !itemLocation.includes(selectedSefar)
        ) {
          return false;
        }
      }
      if (isPriceFilterActive && item.pricePerDay > maxPrice) return false;
      return true;
    });
  }, [allItems, search, city, sefar, maxPrice, isPriceFilterActive]);

  if (loading) {
    return (
      <div className="container py-5 text-center">Loading listings...</div>
    );
  }

  if (!category) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger p-5 text-center">
          <h4 className="mb-3">{t("categoryNotFound")}</h4>
          <p className="mb-4">{t("categoryNotFoundMessage")}</p>
          <Link to="/items" className="btn btn-primary">
            <i className="bi bi-arrow-left me-2" />
            {t("browseAllItems")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="category-page-main">
      {/* Category Hero Banner */}
      <div className="category-page-hero">
        <div className="container">
          <div className="category-hero-inner">
            <div className="category-hero-icon">
              <i className={`bi ${category.icon}`}></i>
            </div>
            <div>
              <span className="section-label">{t("category")}</span>
              <h1 className="category-hero-title">{category.name}</h1>
              <p className="category-hero-desc">{category.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        {/* Back link */}
        <div className="mb-4">
          <Link to="/items" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1" /> {t("allItems")}
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="category-filter-bar mb-4 p-3 rounded-3 border bg-white shadow-sm">
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label
                className="form-label fw-bold mb-1"
                style={{ fontSize: "0.8rem" }}
              >
                <i className="bi bi-search text-danger me-1"></i>
                {t("search")}
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder={t("searchItemsPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label
                className="form-label fw-bold mb-1"
                style={{ fontSize: "0.8rem" }}
              >
                <i className="bi bi-geo-alt text-danger me-1"></i>
                {t("location")}
              </label>
              <select
                className="form-select form-select-sm"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setSefar("all");
                }}
              >
                <option value="all">{t("allCities")}</option>
                <option value="Jigjiga">Jigjiga</option>
                <option value="Dire Dawa">Dire Dawa</option>
                <option value="Harar">Harar</option>
              </select>
            </div>
            {city !== "all" && (
              <div className="col-md-2">
                <label
                  className="form-label fw-bold mb-1"
                  style={{ fontSize: "0.8rem" }}
                >
                  <i className="bi bi-signpost text-danger me-1"></i>
                  {t("sefar")}
                </label>
                <select
                  className="form-select form-select-sm"
                  value={sefar}
                  onChange={(e) => setSefar(e.target.value)}
                >
                  <option value="all">{t("allSefar")}</option>
                  {sefarOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-3">
              <div className="d-flex justify-content-between mb-1">
                <label
                  className="form-label fw-bold mb-0"
                  style={{ fontSize: "0.8rem" }}
                >
                  <i className="bi bi-tag text-danger me-1"></i>
                  {t("maxPrice")}
                </label>
                <span
                  className="text-danger fw-bold"
                  style={{ fontSize: "0.75rem" }}
                >
                  ETB {Number(maxPrice).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                className="form-range"
                min="500"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setIsPriceFilterActive(true);
                }}
              />
            </div>
            <div className="col-md-2">
              <span className="badge bg-danger-subtle text-danger fw-bold px-3 py-2 rounded-pill">
                {filteredItems.length} {t("availableItems") || "listings"}
              </span>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-5">
            <i
              className="bi bi-search text-muted"
              style={{ fontSize: "3rem" }}
            ></i>
            <p className="text-muted mt-3">{t("itemNotFound")}</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredItems.map((item) => (
              <div className="col-md-6 col-lg-4" key={item.id}>
                <CategoryListingCard item={item} t={t} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function CategoryListingCard({ item, t }) {
  const displayPrice = item.price || formatDailyPrice(item.pricePerDay || 0);

  return (
    <article className="premium-glass-card listing-card-premium">
      {/* Image */}
      <div className="card-img-wrapper">
        <img src={item.image} alt={item.title} className="card-img" />
        <div className="card-badges">
          {item.featured && (
            <span className="badge-featured">{t("featured")}</span>
          )}
        </div>
        {item.rating && (
          <span className="badge-photos">
            <i className="bi bi-star-fill text-warning"></i> {item.rating}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="card-body-premium">
        {/* City • Sefar */}
        <div className="d-flex align-items-center gap-1 mb-2">
          <i
            className="bi bi-geo-alt-fill text-danger"
            style={{ fontSize: "0.8rem" }}
          ></i>
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            {item.city}
            {item.sefar ? ` • ${item.sefar}` : ""}
          </span>
        </div>

        {/* Title */}
        <h3 className="card-title">{item.title}</h3>

        {/* Price */}
        <p className="card-price-premium">
          <strong>{displayPrice}</strong> <small>/ {t("perDay")}</small>
        </p>

        {/* Owner */}
        <div className="card-owner-info">
          <div className="owner-avatar">
            {(item.owner || item.ownerName || "V").charAt(0)}
          </div>
          <span className="owner-name">
            {item.owner || item.ownerName || "Verified Owner"}
          </span>
          <i
            className="bi bi-patch-check-fill text-success"
            title="Verified Owner"
          ></i>
        </div>

        {/* Actions */}
        <div className="category-card-actions">
          <Link to={`/items/${item.id}`} className="btn-view-details">
            {t("viewDetails")} <i className="bi bi-arrow-right"></i>
          </Link>
          <Link to={`/items/${item.id}`} className="btn-contact-owner">
            <i className="bi bi-chat-dots"></i> {t("contactOwner")}
          </Link>
        </div>
      </div>
    </article>
  );
}
