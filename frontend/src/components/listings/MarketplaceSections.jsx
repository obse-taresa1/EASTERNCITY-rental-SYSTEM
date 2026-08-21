import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ListingCard from "../cards/ListingCard.jsx";
import { useRefreshToken } from "../../context/RefreshContext.jsx";
import { getPublicListings } from "../../services/listingApiService.js";
import { fetchFeaturedListings } from "../../services/promotionApiService.js";

// The curated list of item titles the owner wants on the homepage
const CURATED_TITLES = [
  "Toyota Hiace Van",
  "Toyota Yaris",
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

export default function MarketplaceSections() {
  const [savedListings, setSavedListings] = useState([]);
  const [featuredAds, setFeaturedAds] = useState([]);
  const marketplaceRefreshToken = useRefreshToken(["listings", "promotions", "banner-ads"]);

  useEffect(() => {
    getPublicListings().then(setSavedListings).catch(() => setSavedListings([]));
    fetchFeaturedListings().then(setFeaturedAds).catch(() => setFeaturedAds([]));
  }, [marketplaceRefreshToken]);

  // Build featured cards (already deduplicated by backend, but guard again)
  const mappedFeatured = useMemo(() => {
    const seen = new Set();
    return featuredAds
      .filter(f => {
        const id = f.listing?.id || f.listingId;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map(f => ({
        ...f.listing,
        id: f.listing?.id || f.listingId,
        discountPercent: f.discountPercent,
        discountedPrice: f.discountedPrice,
        featured: true,
        isFeatured: true,
        priceType: f.listing?.priceType || "Day",
      }));
  }, [featuredAds]);

  const sections = useMemo(() => {
    // IDs that are already shown as featured — exclude from curated sections
    const featuredIds = new Set(mappedFeatured.map(f => f.id));

    const curatedItems = CURATED_TITLES
      .map(title => savedListings.find(item => item.title === title))
      .filter(item => item && !featuredIds.has(item.id));

    const rows = [];
    for (let i = 0; i < curatedItems.length; i += 4) {
      rows.push(curatedItems.slice(i, i + 4));
    }

    const sectionLabels = [
      { title: "Marketplace Highlights", label: "Top Picks" },
      { title: "Trending Near You", label: "Local Demand" },
      { title: "Staff Recommendations", label: "EasternCity Picks" },
      { title: "More Rentals", label: "Discover" },
    ];

    return rows.map((listings, idx) => ({
      title: sectionLabels[idx]?.title || "More Listings",
      label: sectionLabels[idx]?.label || "Curated",
      viewAllLink: "/items",
      listings,
    }));
  }, [savedListings, mappedFeatured]);

  return (
    <section className="marketplace-sections pb-5">
      <div className="container">

        {/* ── Featured Listings Section ── */}
        {mappedFeatured.length > 0 && (
          <div className="marketplace-row">
            <div className="premium-section-header">
              <div>
                <span className="section-label featured-label">
                  <i className="bi bi-star-fill me-1" />
                  Promoted
                </span>
                <h2>Featured Listings</h2>
              </div>
              <Link to="/featured" className="view-all-link">
                View All <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <div className="row g-4">
              {mappedFeatured.map(item => (
                <div className="col-sm-6 col-lg-3" key={`featured-${item.id}`}>
                  <ListingCard item={item} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Curated Sections ── */}
        {sections.map(section => (
          <div className="marketplace-row" key={section.title}>
            <div className="premium-section-header">
              <div>
                <span className="section-label">{section.label}</span>
                <h2>{section.title}</h2>
              </div>
              <Link to={section.viewAllLink} className="view-all-link">
                View All <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <div className="row g-4">
              {section.listings.map(item => (
                <div className="col-sm-6 col-lg-3" key={`${section.title}-${item.id}`}>
                  <ListingCard item={item} />
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </section>
  );
}
