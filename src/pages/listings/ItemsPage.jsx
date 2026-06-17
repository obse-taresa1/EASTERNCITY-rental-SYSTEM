import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ItemGrid from "../../components/listings/ItemGrid.jsx";
import SectionHeader from "../../components/common/SectionHeader.jsx";
import { searchItems } from "../../services/itemService.js";

export default function ItemsPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);

  const filteredItems = useMemo(() => searchItems(search), [search]);

  return (
    <main className="container py-5">
      <SectionHeader
        eyebrow="Browse Rentals"
        title="Available Items"
        description="Find vehicles, tools, electronics, cameras, furniture, and sports equipment for rent."
      />

      <form className="row g-3 mb-4" onSubmit={(event) => event.preventDefault()}>
        <div className="col-md-9">
          <input
            type="search"
            className="form-control"
            placeholder="Search items, categories, or locations"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="col-md-3">
          <button className="btn btn-accent-custom w-100" type="submit">
            <i className="bi bi-search" /> Search
          </button>
        </div>
      </form>

      <ItemGrid items={filteredItems} />
    </main>
  );
}