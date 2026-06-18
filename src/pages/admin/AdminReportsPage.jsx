import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import { getBookings } from "../../services/bookingService.js";
import { formatCurrency } from "../../utils/currency.js";

export default function AdminReportsPage() {
  const bookings = getBookings();

  return (
    <main className="dashboard-content">
      <span className="section-label">ADMIN</span>
      <h1>Reports</h1>

      <AdminDataTable
        columns={[
          { key: "id", label: "Report ID" },
          { key: "itemTitle", label: "Item" },
          { key: "userName", label: "User" },
          {
            key: "totalAmount",
            label: "Total",
            render: (row) => formatCurrency(row.totalAmount),
          },
          { key: "paymentMethod", label: "Payment Method" },
          { key: "status", label: "Status" },
        ]}
        rows={bookings}
      />
    </main>
  );
}
