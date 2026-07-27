import ListingCard from "../cards/ListingCard.jsx";
import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { getPublicListings } from "../../services/listingApiService.js";

// Pick one representative item per category to ensure visual variety
function pickOnePer(listings) {
  const seen = new Set();
  const result = [];
  for (const item of listings) {
    const key = item.categoryKey || item.category || "other";
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

export default function ExploreItemsSection() {
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadListings() {
      try {
        const data = await getPublicListings();
        const combined = Array.isArray(data) ? data : [];
        const seen = new Set();
        const deduped = combined.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        if (active) setListings(deduped);
      } catch {
        if (active) setListings([]);
      }
    }

    loadListings();
    return () => {
      active = false;
    };
  }, []);

  const filtered = listings.filter((item) => {
    const s = String(item.status || "").toLowerCase();
    if (["draft", "rejected", "expired", "payment-pending"].includes(s)) return false;
    if (statusFilter === "new") return s === "new" || item.status === "new";
    if (statusFilter === "used") return s === "used" || item.condition === "used";
    return true;
  });

  // Always show one per category (varied, not all cars)
  const visibleListings = pickOnePer(filtered).slice(0, 8);

  return (
    <section id="featured-listings" className="section-listings py-5">
      <div className="container">
        <div className="premium-section-header">
          <div>
            <span className="section-label">{t("trustedRentalService")}</span>
            <h2>{t("exploreAllItems")}</h2>
          </div>
          <div className="status-tabs d-none d-md-flex" style={{ gap: "0.5rem" }}>
            {["all", "new", "used"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                style={{
                  padding: "0.4rem 1.1rem",
                  borderRadius: "9999px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  border:
                    statusFilter === f ? "none" : "1.5px solid #dce1e8",
                  background:
                    statusFilter === f
                      ? "linear-gradient(135deg, #e31e24 0%, #ff6b6b 100%)"
                      : "#fff",
                  color: statusFilter === f ? "#fff" : "#4b5563",
                  cursor: "pointer",
                  boxShadow:
                    statusFilter === f
                      ? "0 4px 12px rgba(227,30,36,0.25)"
                      : "none",
                  transition: "all 0.2s ease",
                }}
              >
                {f === "all"
                  ? t("allStatus")
                  : f === "new"
                  ? t("newItems")
                  : t("usedItems")}
              </button>
            ))}
          </div>
        </div>

        <div className="row g-4 listings-grid">
          {visibleListings.map((item) => (
            <div
              className="col-sm-6 col-lg-3"
              data-status={item.status}
              key={item.id}
            >
              <ListingCard item={item} />
            </div>
          ))}
          {visibleListings.length === 0 && (
            <div className="col-12 text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 mb-3 d-block" />
              <p>No listings to display yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
