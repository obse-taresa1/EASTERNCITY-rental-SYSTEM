import { useEffect, useState } from "react";
import AdminStatGrid from "../../components/admin/AdminStatGrid.jsx";
import { adminApi } from "../../services/adminManagementService.js";
import { formatCurrency } from "../../utils/currency.js";

export default function AdminStatisticsPage() {
  const [data, setData] = useState({ userGrowth: 0, listingGrowth: 0, bookingGrowth: 0, listingFeeRevenue: 0 });
  useEffect(() => { adminApi.analytics({ range: "year" }).then(setData).catch(console.error); }, []);
  return <main className="dashboard-content"><span className="section-label">ADMIN</span><h1>Statistics</h1><AdminStatGrid stats={[{ icon: "bi-people", label: "Total Users", value: data.userGrowth }, { icon: "bi-box-seam", label: "Total Listings", value: data.listingGrowth, tone: "success" }, { icon: "bi-calendar-check", label: "Total Bookings", value: data.bookingGrowth, tone: "warning" }, { icon: "bi-cash-stack", label: "Total Revenue", value: formatCurrency((data.listingFeeRevenue || 0) + (data.promoRevenue || 0)), tone: "info" }]} /></main>;
}
