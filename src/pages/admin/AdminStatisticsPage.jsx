import { useEffect, useState } from "react";
import AdminStatGrid from "../../components/admin/AdminStatGrid.jsx";
import { getBookings } from "../../services/bookingService.js";
import { getUsers } from "../../services/userApiService.js";
import { items } from "../../data/items.js";
import { formatCurrency } from "../../utils/currency.js";

export default function AdminStatisticsPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let active = true;

    getUsers().then((data) => {
      if (active) setUsers(data);
    });

    return () => {
      active = false;
    };
  }, []);

  const bookings = getBookings();

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount || 0),
    0,
  );

  return (
    <main className="dashboard-content">
      <span className="section-label">ADMIN</span>
      <h1>Statistics</h1>

      <AdminStatGrid
        stats={[
          {
            icon: "bi-people",
            label: "Total Users",
            value: users.length,
          },
          {
            icon: "bi-box-seam",
            label: "Total Listings",
            value: items.length,
            tone: "success",
          },
          {
            icon: "bi-calendar-check",
            label: "Total Bookings",
            value: bookings.length,
            tone: "warning",
          },
          {
            icon: "bi-cash-stack",
            label: "Total Revenue",
            value: formatCurrency(totalRevenue),
            tone: "info",
          },
        ]}
      />
    </main>
  );
}
