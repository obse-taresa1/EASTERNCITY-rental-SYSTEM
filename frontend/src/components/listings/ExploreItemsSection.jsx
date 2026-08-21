import ListingCard from "../cards/ListingCard.jsx";
import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { getPublicListings } from "../../services/listingApiService.js";

const CURATED_TITLES = [
  "Toyota Hiace Van",
  "Cooler Box",
  "Camping Chair Set",
  "Banquet Tables Set",
  "Barbecue Grill",
  "Wedding Tent",
  "Canon DSLR Camera Kit",
  "Wedding Chairs Set",
  "Portable Generator",
  "Stage Platform",
  "Mels Dress",
  "Somali Dress",
  "Harari Wedding Dress",
  "Camping Tent",
  "Mountain Bike Pro",
  "Hyundai Tucson SUV",
];

/**
 * Deterministic condition map per item title.
 * "new"  → brand-new / rarely used item
 * "used" → second-hand / well-used item
 */
const CONDITION_MAP = {
  "Toyota Hiace Van": "new",
  "Cooler Box": "used",
  "Camping Chair Set": "used",
  "Banquet Tables Set": "used",
  "Barbecue Grill": "new",
  "Wedding Tent": "new",
  "Canon DSLR Camera Kit": "new",
  "Wedding Chairs Set": "used",
  "Portable Generator": "new",
  "Stage Platform": "used",
  "Mels Dress": "new",
  "Somali Dress": "new",
  "Harari Wedding Dress": "used",
  "Camping Tent": "new",
  "Mountain Bike Pro": "used",
  "Hyundai Tucson SUV": "new",
};

/** Returns the resolved condition for an item:
 *  1. Uses item.condition if the DB has it ("new" | "used")
 *  2. Falls back to the static CONDITION_MAP by title
 *  3. Defaults to "new" if nothing matches
 */
function getItemCondition(item) {
  const dbCond = (item.condition || "").toLowerCase();
  if (dbCond === "new" || dbCond === "used") return dbCond;
  return CONDITION_MAP[item.title] ?? "new";
}

export default function ExploreItemsSection() {
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [conditionFilter, setConditionFilter] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadListings() {
      try {
        const data = await getPublicListings();
        const combined = Array.isArray(data) ? data : [];
        // Only keep curated items, in the order specified
        const curated = CURATED_TITLES
          .map((title) => combined.find((item) => item.title === title))
          .filter(Boolean);
        if (active) setListings(curated);
      } catch {
        if (active) setListings([]);
      }
    }

    loadListings();
    return () => { active = false; };
  }, []);

  // Filter by condition: "all" → show everything, "new" / "used" → exact match
  const filteredListings = listings.filter((item) => {
    if (conditionFilter === "all") return true;
    return getItemCondition(item) === conditionFilter;
  });

  const visibleListings = filteredListings.slice(0, 8);

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
                onClick={() => setConditionFilter(f)}
                style={{
                  padding: "0.4rem 1.1rem",
                  borderRadius: "9999px",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  border:
                    conditionFilter === f ? "none" : "1.5px solid #dce1e8",
                  background:
                    conditionFilter === f
                      ? "linear-gradient(135deg, #e31e24 0%, #ff6b6b 100%)"
                      : "#fff",
                  color: conditionFilter === f ? "#fff" : "#4b5563",
                  cursor: "pointer",
                  boxShadow:
                    conditionFilter === f
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
          {visibleListings.map((item) => {
            // Inject resolved condition so ListingCard → CardImageSlider shows it
            const enriched = { ...item, condition: getItemCondition(item) };
            return (
              <div
                className="col-sm-6 col-lg-3"
                data-condition={enriched.condition}
                key={item.id}
              >
                <ListingCard item={enriched} showCondition={true} />
              </div>
            );
          })}
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
