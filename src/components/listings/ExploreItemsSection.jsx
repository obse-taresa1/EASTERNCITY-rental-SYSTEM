import ListingCard from "../cards/ListingCard.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { homeListings } from "../../data/homeListings.js";

export default function ExploreItemsSection() {
  const { t } = useLanguage();

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
          {homeListings.map((item) => (
            <div
              className="col-md-6 col-lg-4 listing-col"
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
