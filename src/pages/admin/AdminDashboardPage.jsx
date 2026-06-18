import AdminStatGrid from "../../components/admin/AdminStatGrid.jsx";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import { getBookings } from "../../services/bookingService.js";
import { getUsers } from "../../services/authService.js";
import { items } from "../../data/items.js";
import { formatCurrency } from "../../utils/currency.js";

export default function AdminDashboardPage() {
  const users = getUsers();
  const bookings = getBookings();

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0,
  );

  const stats = [
    {
      icon: "bi-people",
      label: "Users",
      value: users.length,
    },
    {
      icon: "bi-box-seam",
      label: "Listings",
      value: items.length,
      tone: "success",
    },
    {
      icon: "bi-calendar-check",
      label: "Bookings",
      value: bookings.length,
      tone: "warning",
    },
    {
      icon: "bi-cash-stack",
      label: "Revenue",
      value: formatCurrency(totalRevenue),
      tone: "info",
    },
  ];

  return (
    <main className="dashboard-content">
      <span className="section-label">ADMIN DASHBOARD</span>
      <h1>Platform Overview</h1>

      <AdminStatGrid stats={stats} />

      <h2 className="h4 mb-3">Recent Bookings</h2>
      <AdminDataTable
        columns={[
          { key: "itemTitle", label: "Item" },
          { key: "userName", label: "Renter" },
          {
            key: "totalAmount",
            label: "Amount",
            render: (row) => formatCurrency(row.totalAmount),
          },
          { key: "paymentMethod", label: "Payment" },
          { key: "status", label: "Status" },
        ]}
        rows={bookings.slice(0, 6)}
      />
    </main>
  );
}
