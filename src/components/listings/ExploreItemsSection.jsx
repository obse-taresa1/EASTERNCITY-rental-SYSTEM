import ListingCard from "../cards/ListingCard.jsx";
import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { getAllItems } from "../../services/itemService.js";
import { getPublicListings } from "../../services/listingApiService.js";

export default function ExploreItemsSection() {
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadListings() {
      try {
        const data = await getPublicListings();
        if (active) setListings(data);
      } catch {
        if (active) setListings(getAllItems());
      }
    }

    loadListings();
    return () => {
      active = false;
    };
  }, []);

  const visibleListings = listings
    .filter(
      (item) =>
        !["draft", "rejected", "expired", "pending"].includes(
          String(item.status || "").toLowerCase(),
        ),
    )
    .slice(0, 8);

  return (
    <section id="featured-listings" className="section-listings py-5">
      <div className="container">
        <input
          type="radio"
          name="listing-status"
          id="status-all"
          className="status-radio"
          defaultChecked
        />
        <input
          type="radio"
          name="listing-status"
          id="status-new"
          className="status-radio"
        />
        <input
          type="radio"
          name="listing-status"
          id="status-used"
          className="status-radio"
        />

        <div className="listings-header">
          <div>
            <span className="section-label">{t("trustedRentalService")}</span>
            <h2>{t("exploreAllItems")}</h2>
          </div>
          <div className="status-tabs">
            <label className="status-tab" htmlFor="status-all">
              {t("allStatus")}
            </label>
            <label className="status-tab" htmlFor="status-new">
              {t("newItems")}
            </label>
            <label className="status-tab" htmlFor="status-used">
              {t("usedItems")}
            </label>
          </div>
        </div>

        <div className="row g-4 listings-grid">
          {visibleListings.map((item) => (
            <div
              className="col-sm-6 col-lg-3 listing-col"
              data-status={item.status}
              key={item.id}
            >
              <ListingCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
