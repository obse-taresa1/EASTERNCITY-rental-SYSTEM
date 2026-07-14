import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ListingCard from "../cards/ListingCard.jsx";
import {
  getPromotionPlacement,
  sortPromotedListingsFirst,
} from "../../services/itemService.js";
import { getPublicListings } from "../../services/listingApiService.js";
import { fetchActivePromotions } from "../../services/promotionApiService.js";

const sectionDefinitions = [
  {
    title: "Featured Listings",
    label: "Promoted",
    filter: (item) => getPromotionPlacement(item) === "featured",
  },
  {
    title: "Top Listings",
    label: "Priority placement",
    filter: (item) => getPromotionPlacement(item) === "top-listing",
  },
  {
    title: "Trending Near You",
    label: "Local demand",
    filter: (item) => item.city === "Jigjiga" || item.featured,
  },
  {
    title: "Recently Added",
    label: "Fresh rentals",
    filter: () => true,
  },
  {
    title: "Verified Owner Picks",
    label: "Trusted owners",
    filter: (item) =>
      item.verifiedOwner !== false || item.verificationStatus === "verified",
  },
  {
    title: "Most Contacted Listings",
    label: "High response",
    filter: (item) =>
      Number(item.inquiries || 0) >= 10 || Number(item.messages || 0) >= 5,
  },
  {
    title: "Popular This Week",
    label: "Moving fast",
    filter: (item) => item.featured || Number(item.rating || 0) >= 4.8,
  },
  {
    title: "Staff Recommendations",
    label: "EasternCity picks",
    filter: (item) =>
      [
        "electronics-cameras",
        "construction-diy",
        "party-wedding",
        "vehicles",
      ].includes(item.category) || item.featured,
  },
];

function findHomepageBanner(listings, promotions) {
  const listingsById = new Map(listings.map((item) => [String(item.id), item]));
  const homepagePromotion = (promotions || []).find(
    (promotion) =>
      getPromotionPlacement(promotion) === "homepage-banner" &&
      listingsById.has(String(promotion.listingId)),
  );

  if (!homepagePromotion) return null;

  return {
    promotion: homepagePromotion,
    listing: listingsById.get(String(homepagePromotion.listingId)),
  };
}

export default function MarketplaceSections() {
  const [savedListings, setSavedListings] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const marketplaceListings = useMemo(() => {
    const savedById = new Map(savedListings.map((item) => [item.id, item]));
    const merged = [...savedById.values()];
    return sortPromotedListingsFirst(
      merged.filter(
        (item) =>
          ["approved", "active", "featured"].includes(
            String(item.status || "").toLowerCase(),
          ) || item.featured,
      ),
    );
  }, [savedListings]);

  const homepageBanner = useMemo(
    () => findHomepageBanner(marketplaceListings, promotions),
    [marketplaceListings, promotions],
  );

  async function loadListings() {
    try {
      const data = await getPublicListings();
      setSavedListings(data || []);
    } catch {
      setSavedListings([]);
    }
  }

  useEffect(() => {
    let active = true;
    async function loadPromotions() {
      try {
        const data = await fetchActivePromotions();
        if (active) setPromotions(data || []);
      } catch {
        if (active) setPromotions([]);
      }
    }

    loadListings();
    loadPromotions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function refreshListings() {
      loadListings();
    }

    window.addEventListener("easterncity:listings-updated", refreshListings);
    window.addEventListener("easterncity:promotions-updated", refreshListings);
    return () => {
      window.removeEventListener(
        "easterncity:listings-updated",
        refreshListings,
      );
      window.removeEventListener(
        "easterncity:promotions-updated",
        refreshListings,
      );
    };
  }, []);

  return (
    <section className="marketplace-sections py-5">
      <div className="container">
        <div className="marketplace-ad-banner premium-glass-card">
          <div>
            <span className="section-label">
              {homepageBanner ? "Homepage Banner" : "Advertisement"}
            </span>
            <h2>
              {homepageBanner
                ? homepageBanner.listing.title
                : "Business banner spaces are ready for rental partners."}
            </h2>
            {homepageBanner && (
              <p className="text-muted mb-0">
                {homepageBanner.promotion.promotionType} is active until{" "}
                {homepageBanner.promotion.endDate || "the campaign ends"}.
              </p>
            )}
          </div>
          <Link
            to={
              homepageBanner
                ? `/items/${homepageBanner.listing.id}`
                : "/my-listings"
            }
            className="btn btn-accent-custom btn-shine"
          >
            <i className="bi bi-badge-ad" />{" "}
            {homepageBanner ? "View Banner Listing" : "Advertise"}
          </Link>
        </div>

        {sectionDefinitions.map((section) => {
          const listings = sortPromotedListingsFirst(
            marketplaceListings.filter(section.filter),
          ).slice(0, 4);
          if (!listings.length) return null;

          return (
            <div className="marketplace-row" key={section.title}>
              <div className="listings-header">
                <div>
                  <span className="section-label">{section.label}</span>
                  <h2>{section.title}</h2>
                </div>
              </div>
              <div className="row g-4">
                {listings.map((item) => (
                  <div
                    className="col-sm-6 col-lg-3"
                    key={`${section.title}-${item.id}`}
                  >
                    <ListingCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
