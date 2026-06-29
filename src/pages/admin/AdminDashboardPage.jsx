import AdminStatGrid from "../../components/admin/AdminStatGrid.jsx";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import { getBookings } from "../../services/bookingService.js";
import { getUsers, normalizeRole } from "../../services/authService.js";
import { getAllItems } from "../../services/itemService.js";
import { formatCurrency } from "../../utils/currency.js";

export default function AdminDashboardPage() {
  const users = getUsers();
  const bookings = getBookings();
  const items = getAllItems();
  
  const platformUsers = users.filter((user) => normalizeRole(user.role) === "USER");
  
  const activeListings = items.filter(i => i.available !== false);
  const pendingListings = items.filter(i => i.status === 'pending');
  const featuredListings = items.filter(i => i.isFeatured || i.rating >= 4.8); // Calculate featured based on rating
  
  const stats = [
    { icon: "bi-people", label: "Total Users", value: users.length },
    { icon: "bi-person-badge", label: "Total Owners", value: platformUsers.length },
    { icon: "bi-person-check", label: "Total Renters", value: platformUsers.length },
    { icon: "bi-box-seam", label: "Total Listings", value: items.length },
    { icon: "bi-check-circle", label: "Active Listings", value: activeListings.length },
    { icon: "bi-hourglass-split", label: "Pending Listings", value: pendingListings.length },
    { icon: "bi-award", label: "Featured Listings", value: featuredListings.length },
    { icon: "bi-cash-stack", label: "Promotion Requests", value: 4 },
    { icon: "bi-shield-check", label: "Verification Requests", value: 2 },
    { icon: "bi-headset", label: "Support Tickets", value: 3 },
  ];

  return (
    <main className="dashboard-content">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <span className="section-label">ADMIN DASHBOARD</span>
          <h1 className="h3 mb-0">Dashboard Overview</h1>
        </div>
      </div>

      <AdminStatGrid stats={stats} />

      <div className="row mt-4">
        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-people text-primary-custom"></i> Recent Users
            </h2>
            <AdminDataTable
              columns={[
                { key: "name", label: "Name" },
                { key: "role", label: "Role" },
                { key: "email", label: "Email" },
              ]}
              rows={users.slice(-5).reverse()}
            />
          </div>
        </div>
        <div className="col-lg-6 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-box-seam text-primary-custom"></i> Recent Listings
            </h2>
            <AdminDataTable
              columns={[
                { key: "title", label: "Title" },
                { key: "category", label: "Category" },
                { key: "pricePerDay", label: "Price/Day", render: (r) => formatCurrency(r.pricePerDay) },
              ]}
              rows={items.slice(-5).reverse()}
            />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12 mb-4">
          <div className="admin-table-container">
            <h2 className="h5 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-cash-stack text-primary-custom"></i> Recent Promotion Payments
            </h2>
            <AdminDataTable
              columns={[
                { key: "id", label: "Promo Request ID" },
                { key: "itemTitle", label: "Listing Item" },
                { key: "userName", label: "Owner" },
                { key: "totalAmount", label: "Amount", render: (row) => formatCurrency(row.totalAmount || 1000) },
                { key: "status", label: "Status" },
              ]}
              rows={[
                { id: "PR-8291", itemTitle: "Toyota RAV4", userName: "Abebe Rental", totalAmount: 2000, status: "pending" },
                { id: "PR-8292", itemTitle: "Gaming PC", userName: "Tech Hub Rentals", totalAmount: 1000, status: "approved" },
                { id: "PR-8293", itemTitle: "Dewalt Drill Kit", userName: "BuildRight Tools", totalAmount: 500, status: "active" },
              ]}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
