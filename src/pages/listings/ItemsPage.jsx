import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ItemGrid from "../../components/listings/ItemGrid.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { searchItems } from "../../services/itemService.js";

export default function ItemsPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);

  const filteredItems = useMemo(() => searchItems(search), [search]);

  return (
    <main className="container py-5">
      <SectionHeader
        eyebrow={t("browseRentals")}
        title={t("availableItems")}
        description={t("availableItemsDescription")}
      />

      <form className="row g-3 mb-4" onSubmit={(event) => event.preventDefault()}>
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
