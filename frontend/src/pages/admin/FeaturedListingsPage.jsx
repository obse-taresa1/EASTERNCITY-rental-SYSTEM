import { useEffect, useState } from "react";
import ListingCard from "../../components/common/ListingCard.jsx";
import { adminApi } from "../../services/adminManagementService.js";

export default function FeaturedListingsPage() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { adminApi.promotions({ status: "APPROVED" }).then((rows) => setListings(rows.map((p) => ({ ...p.listing, promotion: p })))).catch((err) => { console.error(err); setError("Unable to load featured listings."); }); }, []);
  return <main className="dashboard-content"><div className="d-flex justify-content-between align-items-center mb-4"><div><span className="section-label">ADMIN</span><h1 className="h3 mb-0">Featured Listings</h1><p className="text-muted mb-0">Approved promoted listings currently backed by database promotion records.</p></div></div>{error && <div className="alert alert-danger">{error}</div>}<div className="row g-4">{listings.map((listing) => <div className="col-md-6 col-xl-4" key={listing.id}><ListingCard item={listing} /></div>)}{!listings.length && <div className="col-12"><div className="admin-table-container text-center text-muted py-4">No featured listings yet.</div></div>}</div></main>;
}
