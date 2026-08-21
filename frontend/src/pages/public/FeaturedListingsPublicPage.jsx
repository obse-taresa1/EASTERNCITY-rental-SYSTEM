import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ListingCard from "../../components/cards/ListingCard.jsx";
import { fetchFeaturedListings } from "../../services/promotionApiService.js";

export default function FeaturedListingsPublicPage() {
  const [featuredAds, setFeaturedAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchFeaturedListings()
      .then(setFeaturedAds)
      .catch(() => setFeaturedAds([]))
      .finally(() => setLoading(false));
  }, []);

  const listings = featuredAds.map(f => ({
    ...f.listing,
    id: f.listing?.id || f.listingId,
    discountPercent: f.discountPercent,
    discountedPrice: f.discountedPrice,
    featured: true,
    isFeatured: true,
    priceType: f.listing?.priceType || "Day",
    endDate: f.endDate,
  }));

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <span className="section-label">Promoted</span>
          <h1 className="mb-0" style={{ fontSize: "1.8rem", fontWeight: 800 }}>
            Featured Listings
          </h1>
          <p className="text-muted mt-1 mb-0">
            Hand-picked listings with active promotions — available now.
          </p>
        </div>
        <Link to="/items" className="view-all-link">
          Browse All Listings <i className="bi bi-arrow-right" />
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status" />
          <p className="mt-3 text-muted">Loading featured listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-star fs-1 text-muted mb-3 d-block" />
          <h4 className="text-muted">No featured listings right now</h4>
          <p className="text-muted">Check back later or browse all listings.</p>
          <Link to="/items" className="btn btn-danger mt-2">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {listings.map(item => (
            <div className="col-sm-6 col-lg-3" key={item.id}>
              <ListingCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
