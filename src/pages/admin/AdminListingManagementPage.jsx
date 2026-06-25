import ListingManagementTable from "../../components/dashboard/ListingManagementTable.jsx";
import { getAllItems } from "../../services/itemService.js";

const adPlacements = [
  { slot: "Homepage banner", advertiser: "Dire Rentals", status: "Active", views: "8.4k", revenue: "5,000 ETB" },
  { slot: "Category banner", advertiser: "BuildRight Tools", status: "Scheduled", views: "3.1k", revenue: "3,500 ETB" },
  { slot: "Dashboard promo", advertiser: "Lens House", status: "Active", views: "2.7k", revenue: "3,900 ETB" },
];

export default function AdminListingManagementPage() {
  const items = getAllItems();

  return (
    <main className="dashboard-content">
      <span className="section-label">ADMIN</span>
      <h1>Listing Management</h1>
      <p className="owner-muted">Review approvals, featured visibility, rejected/expired listings, and sponsored advertisement spaces.</p>

      <section className="dashboard-section mt-4">
        <div className="owner-section-heading mb-3">
          <div>
            <h2 className="h4 mb-1">Listing Approval Queue</h2>
            <p className="owner-muted mb-0">Owner-created listings enter pending approval before publication.</p>
          </div>
          <button type="button" className="btn btn-accent-custom btn-shine">
            <i className="bi bi-check2-circle" /> Review Pending
          </button>
        </div>
        <ListingManagementTable items={items} />
      </section>

      <section className="dashboard-section mt-4">
        <div className="owner-section-heading mb-3">
          <div>
            <span className="section-label">ADVERTISEMENTS</span>
            <h2 className="h4 mb-1">Advertisement Spaces</h2>
            <p className="owner-muted mb-0">Manage homepage banners, category banners, and dashboard promotional areas for business advertisers.</p>
          </div>
          <button type="button" className="btn btn-outline-danger">
            <i className="bi bi-plus-circle" /> Add Advertiser
          </button>
        </div>
        <div className="owner-listing-grid">
          {adPlacements.map((placement) => (
            <article className="owner-monetization-card" key={placement.slot}>
              <span>{placement.slot}</span>
              <strong>{placement.advertiser}</strong>
              <small>{placement.status} - {placement.views} views - {placement.revenue}</small>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
