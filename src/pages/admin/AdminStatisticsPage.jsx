import { useEffect, useState } from "react";
import AdminStatGrid from "../../components/admin/AdminStatGrid.jsx";
import { fetchAdminDashboard } from "../../services/dashboardApiService.js";
import { formatCurrency } from "../../utils/currency.js";

export default function AdminStatisticsPage() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    let active = true;
    fetchAdminDashboard({ range: "year" }).then((data) => {
      if (active) setDashboard(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const counts = dashboard?.counts || {};
  const revenue = dashboard?.revenue || {};

  return (
    <main className="dashboard-content">
      <span className="section-label">ADMIN</span>
      <h1>Statistics</h1>

      <AdminStatGrid
        stats={[
          {
            icon: "bi-people",
            label: "Total Users",
            value: counts.totalUsers || 0,
          },
          {
            icon: "bi-box-seam",
            label: "Total Listings",
            value: counts.totalListings || 0,
            tone: "success",
          },
          {
            icon: "bi-calendar-check",
            label: "Total Bookings",
            value: counts.totalRenters || 0,
            tone: "warning",
          },
          {
            icon: "bi-cash-stack",
            label: "Platform Revenue",
            value: formatCurrency(
              Number(revenue.promotionRevenue || 0) +
                Number(revenue.listingFeeRevenue || 0),
            ),
            tone: "info",
          },
        ]}
      />
    </main>
  );
}
