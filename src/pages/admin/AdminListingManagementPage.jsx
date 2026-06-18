import ListingManagementTable from "../../components/dashboard/ListingManagementTable.jsx";
import { items } from "../../data/items.js";

export default function AdminListingManagementPage() {
  return (
    <main className="dashboard-content">
      <span className="section-label">ADMIN</span>
      <h1>Listing Management</h1>

      <section className="dashboard-section mt-4">
        <ListingManagementTable items={items} />
      </section>
    </main>
  );
}
