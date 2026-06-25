import AdminStatGrid from "../../components/admin/AdminStatGrid.jsx";
import { getUsers } from "../../services/authService.js";
import { getBookings } from "../../services/bookingService.js";
import { items } from "../../data/items.js";
import { roleRequests } from "../../data/roleRequests.js";

export default function SuperAdminDashboardPage() {
  const users = getUsers();
  const bookings = getBookings();
  const admins = users.filter((user) => user.role === "admin");

  return (
    <main className="dashboard-content">
      <span className="section-label">SUPER ADMIN</span>
      <h1>System Overview</h1>

      <AdminStatGrid
        stats={[
          {
            icon: "bi-person-badge",
            label: "Admins",
            value: admins.length,
          },
          {
            icon: "bi-people",
            label: "Users",
            value: users.length,
            tone: "success",
          },
          {
            icon: "bi-box-seam",
            label: "Listings",
            value: items.length,
            tone: "warning",
          },
          {
            icon: "bi-person-check",
            label: "Role Requests",
            value: roleRequests.length,
            tone: "info",
          },
        ]}
      />

      <section className="dashboard-section">
        <h2 className="h4 mb-3">System Health</h2>
        <p className="mb-0">
          The rental platform is running normally with {bookings.length} booking
          records.
        </p>
      </section>
    </main>
  );
}
