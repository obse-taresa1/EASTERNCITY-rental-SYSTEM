import { useEffect, useMemo, useState } from "react";
import ListingCard from "../cards/ListingCard.jsx";
import { homeListings } from "../../data/homeListings.js";
import { getAllItems } from "../../services/itemService.js";

const sectionDefinitions = [
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
    filter: (item) => item.verifiedOwner !== false || item.verificationStatus === "verified",
  },
  {
    title: "Most Contacted Listings",
    label: "High response",
    filter: (item) => Number(item.inquiries || 0) >= 10 || Number(item.messages || 0) >= 5,
  },
  {
    title: "Popular This Week",
    label: "Moving fast",
    filter: (item) => item.featured || Number(item.rating || 0) >= 4.8,
  },
  {
    title: "Staff Recommendations",
    label: "EasternCity picks",
    filter: (item) => ["electronics-cameras", "construction-diy", "party-wedding", "vehicles"].includes(item.category) || item.featured,
  },
];

function featuredFirst(listings) {
  return [...listings].sort((a, b) => Number(b.featured) - Number(a.featured));
}

export default function MarketplaceSections() {
  const [savedListings, setSavedListings] = useState(() => getAllItems());
  const marketplaceListings = useMemo(() => {
    const savedById = new Map(savedListings.map((item) => [item.id, item]));
    const merged = [...savedById.values(), ...homeListings.filter((item) => !savedById.has(item.id))];
    return merged.filter((item) => !["draft", "rejected", "expired"].includes(String(item.status || "").toLowerCase()));
  }, [savedListings]);

  useEffect(() => {
    function refreshListings() {
      setSavedListings(getAllItems());
    }

    window.addEventListener("easterncity:listings-updated", refreshListings);
    return () => window.removeEventListener("easterncity:listings-updated", refreshListings);
  }, []);

  return (
    <section className="marketplace-sections py-5">
      <div className="container">
        <div className="marketplace-ad-banner premium-glass-card">
          <div>
            <span className="section-label">Advertisement</span>
            <h2>Business banner spaces are ready for rental partners.</h2>
          </div>
          <button type="button" className="btn btn-accent-custom btn-shine">
            <i className="bi bi-badge-ad" /> Advertise
          </button>
        </div>

        {sectionDefinitions.map((section) => {
          const listings = featuredFirst(marketplaceListings.filter(section.filter)).slice(0, 4);
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
                  <div className="col-sm-6 col-lg-3" key={`${section.title}-${item.id}`}>
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
