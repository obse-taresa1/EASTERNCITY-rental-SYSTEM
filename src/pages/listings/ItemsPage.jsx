import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ItemGrid from "../../components/listings/ItemGrid.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { getPublicListings } from "../../services/listingApiService.js";
import { listingMatchesRentalCategory } from "../../utils/categoryMapping.js";

export default function ItemsPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const city = searchParams.get("city") || "all";
  const sefar = searchParams.get("sefar") || "all";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const condition =
    searchParams.get("condition") || searchParams.get("status") || "all";

  const [search, setSearch] = useState(initialSearch);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    let active = true;

    async function loadListings() {
      setLoading(true);
      try {
        const data = await getPublicListings({
          search: initialSearch,
          city,
          sefar,
          minPrice,
          maxPrice,
          condition,
        });
        if (active) setListings(data);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadListings();
    return () => {
      active = false;
    };
  }, [initialSearch, category, city, sefar, minPrice, maxPrice, condition]);

  const filteredItems = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    return listings.filter((item) => {
      const itemCategory = item.category || item.categoryName || "";
      const itemCondition = String(item.condition || item.itemCondition || "").toLowerCase();

      if (
        condition !== "all" &&
        itemCondition &&
        itemCondition !== String(condition).toLowerCase()
      ) {
        return false;
      }

      if (condition !== "all" && !itemCondition) {
        const conditionTerm = String(condition).toLowerCase();
        const conditionFields = [
          item.title,
          item.description,
          item.categoryName,
          item.category,
          ...(Array.isArray(item.features) ? item.features : []),
        ];
        if (
          !conditionFields
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(conditionTerm))
        ) {
          return false;
        }
      }

      if (searchTerm) {
        const match =
          (item.title || "").toLowerCase().includes(searchTerm) ||
          itemCategory.toLowerCase().includes(searchTerm) ||
          (item.city || "").toLowerCase().includes(searchTerm) ||
          (item.location || "").toLowerCase().includes(searchTerm);
        if (!match) return false;
      }

      if (!listingMatchesRentalCategory(item, category)) {
        return false;
      }

      if (city && city !== "all" && item.city !== city) {
        return false;
      }

      if (sefar && sefar !== "all" && item.sefar !== sefar) {
        return false;
      }

      if (
        minPrice &&
        Number(minPrice) > 0 &&
        Number(item.pricePerDay || 0) < Number(minPrice)
      ) {
        return false;
      }

      if (
        maxPrice &&
        Number(maxPrice) > 0 &&
        Number(item.pricePerDay || 0) > Number(maxPrice)
      ) {
        return false;
      }

      return true;
    });
  }, [search, category, city, sefar, minPrice, maxPrice, condition, listings]);

  if (loading) {
    return <div className="container py-5">Loading items...</div>;
  }

  return (
    <main className="container py-5">
      <SectionHeader
        eyebrow={t("browseRentals")}
        title={t("availableItems")}
        description={t("availableItemsDescription")}
      />

      <form
        className="row g-3 mb-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="col-md-9">
          <input
            type="search"
            className="form-control"
            placeholder={t("searchItemsPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="col-md-3">
          <button className="btn btn-accent-custom w-100" type="submit">
            <i className="bi bi-search" /> {t("search")}
          </button>
        </div>
      </form>

      <ItemGrid items={filteredItems} />
    </main>
  );
}
