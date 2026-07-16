import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ItemGrid from "../../components/listings/ItemGrid.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { getPublicListings } from "../../services/listingApiService.js";

function normalizeFilterValue(value) {
  return String(value || "").trim().toLowerCase();
}

function listingMatchesCategory(item, category) {
  if (!category || category === "all") return true;

  const selectedCategory = normalizeFilterValue(category);
  const itemCategories = [
    item.category,
    item.categoryName,
    item.categoryData?.id,
    item.categoryData?.slug,
    item.categoryData?.name,
  ].map(normalizeFilterValue);

  return itemCategories.includes(selectedCategory);
}

export default function ItemsPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const city = searchParams.get("city") || "all";
  const sefar = searchParams.get("sefar") || "all";
  const maxPrice = searchParams.get("maxPrice") || "";
  const status = searchParams.get("status") || "all";

  const [search, setSearch] = useState(initialSearch);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadListings() {
      setLoading(true);
      try {
        const data = await getPublicListings();
        if (active) setListings(data);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadListings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const filteredItems = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    return listings.filter((item) => {
      const itemStatus = String(item.status || "").toLowerCase();

      if (
        status !== "all" &&
        itemStatus &&
        itemStatus !== String(status).toLowerCase()
      ) {
        return false;
      }

      if (searchTerm) {
        const match =
          (item.title || "").toLowerCase().includes(searchTerm) ||
          (item.category || "").toLowerCase().includes(searchTerm) ||
          (item.categoryName || "").toLowerCase().includes(searchTerm) ||
          (item.city || "").toLowerCase().includes(searchTerm) ||
          (item.location || "").toLowerCase().includes(searchTerm);
        if (!match) return false;
      }

      if (!listingMatchesCategory(item, category)) {
        return false;
      }

      if (city && city !== "all" && item.city !== city) {
        return false;
      }

      if (sefar && sefar !== "all") {
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

      if (
        maxPrice &&
        Number(maxPrice) > 0 &&
        Number(item.pricePerDay || 0) > Number(maxPrice)
      ) {
        return false;
      }

      return true;
    });
  }, [search, category, city, sefar, maxPrice, status, listings]);

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
