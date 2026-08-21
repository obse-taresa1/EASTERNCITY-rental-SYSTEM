import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { categories } from "../../data/items.js";
import { getPublicListings } from "../../services/listingApiService.js";
import { formatDailyPrice } from "../../utils/currency.js";
import { getSefarByCity } from "../../data/sefar.js";
import {
  getCanonicalRentalCategoryId,
  listingMatchesRentalCategory,
  normalizeCategoryToken,
} from "../../utils/categoryMapping.js";
import ListingCard from "../../components/cards/ListingCard.jsx";
import { getCategoryFallbackImage } from "../../utils/categoryFallbacks.js";

export default function CategoryPage() {
  const { categoryId } = useParams();
  const { t } = useLanguage();

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("all");
  const [sefar, setSefar] = useState("all");
  const [maxPrice, setMaxPrice] = useState(25000);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const canonicalCategoryId = getCanonicalRentalCategoryId(categoryId);

  const staticCategory =
    categories.find((item) => {
      const tokens = [item.id, item.slug, item.name].map(normalizeCategoryToken);
      return tokens.includes(normalizeCategoryToken(canonicalCategoryId));
    }) || null;

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      try {
        const listingData = await getPublicListings();
        if (!active) return;
        setListings(Array.isArray(listingData) ? listingData : []);
      } catch {
        if (active) setListings([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [categoryId]);

  const dbCategory = useMemo(() => {
    if (staticCategory) return null;
    const routeToken = normalizeCategoryToken(categoryId);
    const match = listings.find((item) => {
      const categoryData = item.categoryData || {};
      return [categoryData.id, categoryData.slug, categoryData.name, item.category, item.categoryName]
        .map(normalizeCategoryToken)
        .includes(routeToken);
    });

    const categoryData = match?.categoryData || {};
    if (!categoryData.id && !categoryData.slug && !categoryData.name) return null;

    return {
      id: categoryData.slug || categoryData.id,
      name: categoryData.name || categoryData.slug || "Category",
      icon: "bi-box-seam",
      description: categoryData.description || "Explore verified rentals in this category.",
    };
  }, [categoryId, listings, staticCategory]);

  const category = staticCategory || dbCategory;
  const categoryName = category?.nameKey ? t(category.nameKey) : category?.name;
  const categoryDescription = category?.descriptionKey
    ? t(category.descriptionKey)
    : category?.description;

  const allItems = useMemo(
    () =>
      listings.filter((item) =>
        listingMatchesRentalCategory(item, category?.id || canonicalCategoryId || categoryId),
      ),
    [listings, category?.id, canonicalCategoryId, categoryId],
  );

  const sefarOptions = city !== "all" ? getSefarByCity(city) : [];

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const searchTerm = search.toLowerCase().trim();

      // Search filter
      if (
        searchTerm &&
        ![
          item.title,
          item.description,
          item.categoryName,
          item.category,
          item.city,
          item.location,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchTerm))
      ) {
        return false;
      }

      // City filter
      if (
        city !== "all" &&
        String(item.city || "").toLowerCase() !== city.toLowerCase()
      ) {
        return false;
      }

      // Sefar filter
      if (
        sefar !== "all" &&
        !String(item.sefar || item.location || "")
          .toLowerCase()
          .includes(sefar.toLowerCase())
      ) {
        return false;
      }

      // Price filter
      if (item.pricePerDay > maxPrice) {
        return false;
      }

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
              <h1 className="category-hero-title">{categoryName}</h1>
              <p className="category-hero-desc">{categoryDescription}</p>
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
                {filteredItems.length} {t("listings")}
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
                <ListingCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// Helper function - make sure this is defined or imported
function getCategoryKey(item) {
  return item.slug || item.id || item.name?.toLowerCase().replace(/\s+/g, "-");
}

