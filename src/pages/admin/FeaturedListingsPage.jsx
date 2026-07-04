import { useEffect, useState } from "react";
import { fetchActivePromotions } from "../../services/promotionApiService.js";
import ListingCard from "../../components/common/ListingCard.jsx";

/**
 * Admin – Featured Listings Page
 * -------------------------------------------------
 * Displays all listings that have been marked as "featured"
 * (i.e., promotion type "premium" or "vip" that has been
 * approved). The UI follows the project's Premium Red
 * branding and mirrors the design of the other admin
 * pages.
 */
export default function FeaturedListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await fetchActivePromotions();
        if (!active) return;
        const normalised = (data || []).map((item) => ({
          id: item.listingId,
          title: item.listingTitle || item.title,
          description: `${item.promotionType || "Promotion"} | ${item.startDate || "approved"} - ${item.endDate || "ongoing"}`,
          startDate: item.startDate,
          endDate: item.endDate,
        }));
        setListings(normalised);
      } catch (err) {
        console.error("Failed to load featured listings", err);
        setError("Unable to load featured listings.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="section-label">ADMIN</span>
          <h1 className="h3 mb-0">Featured Listings</h1>
          <p className="text-muted mb-0">
            Currently active promoted listings across the platform.
          </p>
        </div>
      </div>

      {loading && <p className="text-muted">Loading featured listings…</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && listings.length === 0 && (
        <p className="text-muted">No featured listings found.</p>
      )}

      <div className="row g-4">
        {listings.map((listing) => (
          <div key={listing.id} className="col-md-4">
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </main>
  );
}
