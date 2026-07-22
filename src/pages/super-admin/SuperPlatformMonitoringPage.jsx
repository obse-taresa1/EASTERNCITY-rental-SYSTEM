import { useEffect, useState } from "react";
import AdminDataTable from "../../components/admin/AdminDataTable.jsx";
import { adminApi } from "../../services/adminManagementService.js";

export default function SuperPlatformMonitoringPage() {
  const [rows, setRows] = useState([]);
  useEffect(() => { adminApi.analytics({ range: "month" }).then((d) => setRows([{ id: "users", name: "User Growth", status: d.userGrowth }, { id: "listings", name: "Listing Growth", status: d.listingGrowth }, { id: "bookings", name: "Booking Growth", status: d.bookingGrowth }])).catch(console.error); }, []);
  return <main className="dashboard-content"><div className="d-flex justify-content-between align-items-end mb-4"><div><span className="section-label">SUPER ADMIN DASHBOARD</span><h1 className="h3 mb-0">Platform Monitoring</h1></div></div><div className="admin-table-container"><h2 className="h5 mb-3 d-flex align-items-center gap-2"><i className="bi bi-table text-primary-custom"></i> Platform Monitoring Data</h2><AdminDataTable columns={[{ key: "id", label: "ID" }, { key: "name", label: "Name" }, { key: "status", label: "Status" }]} rows={rows} /></div></main>;
}
